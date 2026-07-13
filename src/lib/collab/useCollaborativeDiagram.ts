"use client";

/**
 * 共同編集モードの状態管理フック。
 *
 * Yjs の共有ドキュメントを唯一の正とし、ローカルの React 状態はその射影として持つ。
 * ローカル編集は Yjs へ書き込み（LOCAL_ORIGIN 付き）、Yjs の変更は observer 経由で
 * React 状態へ granular に反映する（選択などローカル専用の状態は保つ）。
 *
 * DiagramEditor からは、ローカルモードの useNodesState / useEdgesState と同じ
 * インターフェース（nodes / edges / onNodesChange / onEdgesChange / setNodes / setEdges）で
 * 使えるようにし、既存の編集ハンドラをそのまま流用できるようにする。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";
import YProvider from "y-partyserver/provider";
import {
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from "@xyflow/react";

import type { AppFlowNode } from "@/lib/diagramToFlow";
import type { UmlFlowEdge } from "@/components/edges/UmlEdge";
import {
  flowNodeToRecord,
  hydrateFlowNode,
  flowEdgeToRecord,
  recordToFlowEdge,
  recordsEqual,
  sortByLayer,
  type YNodeRecord,
  type YEdgeRecord,
} from "./yjsDiagram";
import { createUserIdentity, type UserIdentity } from "./room";

/** 同期サーバーのホスト。未設定ならローカル開発の wrangler dev を指す。 */
const SYNC_HOST = process.env.NEXT_PUBLIC_SYNC_HOST ?? "localhost:8787";

/** Durable Object クラス "Document" の kebab 名。クライアントの party 指定に使う。 */
const PARTY = "document";

/** 自分の書き込みを observer 側で無視するための目印。 */
const LOCAL_ORIGIN = "local";

/** setNodes / setEdges の引数（値 or 関数）。 */
type Updater<T> = T[] | ((current: T[]) => T[]);

/** 接続状態。 */
export type ConnectionStatus = "connecting" | "connected" | "disconnected";

/** 他ユーザーのプレゼンス（カーソル・選択）。 */
export interface RemotePresence {
  clientId: number;
  user: UserIdentity;
  cursor: { x: number; y: number } | null;
  selection: string | null;
}

/** DiagramEditor へ渡す共同編集ストア。 */
export interface CollaborativeDiagram {
  nodes: AppFlowNode[];
  edges: UmlFlowEdge[];
  onNodesChange: (changes: NodeChange<AppFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<UmlFlowEdge>[]) => void;
  setNodes: (updater: Updater<AppFlowNode>) => void;
  setEdges: (updater: Updater<UmlFlowEdge>) => void;
  status: ConnectionStatus;
  /** 初期同期が完了したか（新規部屋への引き継ぎ判定に使う）。 */
  synced: boolean;
  self: UserIdentity;
  remote: RemotePresence[];
  setCursor: (pos: { x: number; y: number } | null) => void;
  setSelection: (id: string | null) => void;
}

export function useCollaborativeDiagram(roomId: string): CollaborativeDiagram {
  // このタブのユーザー識別（プレゼンス表示用）。マウント中は固定。
  const self = useMemo(() => createUserIdentity(), []);

  // Y.Doc はマウント中ずっと同一インスタンスを使う（遅延初期化で 1 度だけ生成）。
  const [doc] = useState(() => new Y.Doc());
  const yNodes = useMemo(() => doc.getMap<YNodeRecord>("nodes"), [doc]);
  const yEdges = useMemo(() => doc.getMap<YEdgeRecord>("edges"), [doc]);

  const [nodes, setNodesState] = useState<AppFlowNode[]>([]);
  const [edges, setEdgesState] = useState<UmlFlowEdge[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [synced, setSynced] = useState(false);
  const [remote, setRemote] = useState<RemotePresence[]>([]);

  // 連続呼び出しでも最新値を読めるよう、状態をミラーする ref。
  const nodesRef = useRef<AppFlowNode[]>([]);
  const edgesRef = useRef<UmlFlowEdge[]>([]);
  const providerRef = useRef<YProvider | null>(null);

  const commitNodes = useCallback((next: AppFlowNode[]) => {
    const sorted = sortByLayer(next);
    nodesRef.current = sorted;
    setNodesState(sorted);
  }, []);

  const commitEdges = useCallback((next: UmlFlowEdge[]) => {
    edgesRef.current = next;
    setEdgesState(next);
  }, []);

  // ローカル編集 → 共有 Map へ差分反映（削除・追加・更新）。
  const setNodes = useCallback(
    (updater: Updater<AppFlowNode>) => {
      const prev = nodesRef.current;
      const next = typeof updater === "function" ? updater(prev) : updater;
      const nextIds = new Set(next.map((node) => node.id));
      doc.transact(() => {
        // 削除は「直前まで自分の手元にあり、今回消えたもの」だけに限定する。
        // 共有 Map にあってローカル未反映の要素（他ユーザーが今追加した等）は
        // 全集合リコンサイルで巻き込まないようにする（消失バグ対策）。
        for (const node of prev) {
          if (!nextIds.has(node.id)) yNodes.delete(node.id);
        }
        for (const node of next) {
          const record = flowNodeToRecord(node);
          if (!recordsEqual(yNodes.get(node.id), record)) {
            yNodes.set(node.id, record);
          }
        }
      }, LOCAL_ORIGIN);
      // ビューには next に加えて「共有 Map にしか無い要素」も足す。
      // 相手が追加済みの要素を、自分の編集反映で画面から落とさないため。
      // 前ノードがあれば measured 等を引き継ぐ（未計測での非表示を防ぐ）。
      const prevById = new Map(prev.map((node) => [node.id, node]));
      const merged = next.slice();
      yNodes.forEach((record, id) => {
        if (!nextIds.has(id)) {
          merged.push(hydrateFlowNode(prevById.get(id), record));
        }
      });
      commitNodes(merged);
    },
    [doc, yNodes, commitNodes]
  );

  const setEdges = useCallback(
    (updater: Updater<UmlFlowEdge>) => {
      const prev = edgesRef.current;
      const next = typeof updater === "function" ? updater(prev) : updater;
      const nextIds = new Set(next.map((edge) => edge.id));
      doc.transact(() => {
        // ノードと同様、消したのは「直前まで手元にあり今回消えた関連」だけに限定。
        for (const edge of prev) {
          if (!nextIds.has(edge.id)) yEdges.delete(edge.id);
        }
        for (const edge of next) {
          const record = flowEdgeToRecord(edge);
          if (!recordsEqual(yEdges.get(edge.id), record)) {
            yEdges.set(edge.id, record);
          }
        }
      }, LOCAL_ORIGIN);
      // ノード同様、共有 Map にしか無い関連もビューに足す。
      const merged = next.slice();
      yEdges.forEach((record, id) => {
        if (!nextIds.has(id)) merged.push(recordToFlowEdge(record));
      });
      commitEdges(merged);
    },
    [doc, yEdges, commitEdges]
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<AppFlowNode>[]) => {
      setNodes(applyNodeChanges(changes, nodesRef.current));
    },
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<UmlFlowEdge>[]) => {
      setEdges(applyEdgeChanges(changes, edgesRef.current));
    },
    [setEdges]
  );

  // Provider 接続・observer・awareness の登録（room ごとに 1 度）。
  useEffect(() => {
    const provider = new YProvider(SYNC_HOST, roomId, doc, { party: PARTY });
    providerRef.current = provider;
    const awareness = provider.awareness;
    awareness.setLocalStateField("user", self);

    // 共有状態を丸ごと React 状態へ組み直す（初期同期・再同期時）。
    const rebuildAll = () => {
      const prevNodes = new Map(nodesRef.current.map((n) => [n.id, n]));
      const nodeArr: AppFlowNode[] = [];
      // 計測サイズ・選択などローカル専用状態を前ノードから引き継ぐ。
      yNodes.forEach((record, id) =>
        nodeArr.push(hydrateFlowNode(prevNodes.get(id), record))
      );
      commitNodes(nodeArr);

      const prevEdges = new Map(edgesRef.current.map((e) => [e.id, e]));
      const edgeArr: UmlFlowEdge[] = [];
      yEdges.forEach((record, id) => {
        const edge = recordToFlowEdge(record);
        edge.selected = prevEdges.get(id)?.selected;
        edgeArr.push(edge);
      });
      commitEdges(edgeArr);
    };

    // 他ユーザーの変更だけを granular に取り込む（自分の変更は反映済み）。
    const onNodesEvent = (
      event: Y.YMapEvent<YNodeRecord>,
      transaction: Y.Transaction
    ) => {
      if (transaction.origin === LOCAL_ORIGIN) return;
      const byId = new Map(nodesRef.current.map((n) => [n.id, n]));
      event.changes.keys.forEach((change, key) => {
        if (change.action === "delete") {
          byId.delete(key);
          return;
        }
        const record = yNodes.get(key);
        if (!record) return;
        // 計測サイズ・選択・ドラッグ状態を引き継ぐ（移動中の相手ノードが
        // 未計測扱いで消えるのを防ぐ）。
        byId.set(key, hydrateFlowNode(byId.get(key), record));
      });
      commitNodes(Array.from(byId.values()));
    };

    const onEdgesEvent = (
      event: Y.YMapEvent<YEdgeRecord>,
      transaction: Y.Transaction
    ) => {
      if (transaction.origin === LOCAL_ORIGIN) return;
      const byId = new Map(edgesRef.current.map((e) => [e.id, e]));
      event.changes.keys.forEach((change, key) => {
        if (change.action === "delete") {
          byId.delete(key);
          return;
        }
        const record = yEdges.get(key);
        if (!record) return;
        const fresh = recordToFlowEdge(record);
        fresh.selected = byId.get(key)?.selected;
        byId.set(key, fresh);
      });
      commitEdges(Array.from(byId.values()));
    };

    yNodes.observe(onNodesEvent);
    yEdges.observe(onEdgesEvent);

    const onStatus = (event: { status: ConnectionStatus }) =>
      setStatus(event.status);
    const onSync = (isSynced: boolean) => {
      if (isSynced) {
        rebuildAll();
        setSynced(true);
        setStatus("connected");
      }
    };
    provider.on("status", onStatus);
    provider.on("sync", onSync);

    const onAwareness = () => {
      const others: RemotePresence[] = [];
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID) return;
        const user = state.user as UserIdentity | undefined;
        if (!user) return;
        others.push({
          clientId,
          user,
          cursor: (state.cursor as RemotePresence["cursor"]) ?? null,
          selection: (state.selection as string | null) ?? null,
        });
      });
      setRemote(others);
    };
    awareness.on("change", onAwareness);

    return () => {
      yNodes.unobserve(onNodesEvent);
      yEdges.unobserve(onEdgesEvent);
      awareness.off("change", onAwareness);
      provider.off("status", onStatus);
      provider.off("sync", onSync);
      provider.destroy();
      providerRef.current = null;
    };
  }, [roomId, doc, yNodes, yEdges, self, commitNodes, commitEdges]);

  // マウント終了時に Doc を破棄してメモリを解放する。
  useEffect(() => {
    return () => {
      doc.destroy();
    };
  }, [doc]);

  const setCursor = useCallback((pos: { x: number; y: number } | null) => {
    providerRef.current?.awareness.setLocalStateField("cursor", pos);
  }, []);

  const setSelection = useCallback((id: string | null) => {
    providerRef.current?.awareness.setLocalStateField("selection", id);
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    status,
    synced,
    self,
    remote,
    setCursor,
    setSelection,
  };
}
