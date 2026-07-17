"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type OnSelectionChangeFunc,
} from "@xyflow/react";

import type { ClassNode, Diagram, PackageNode } from "@/types/diagram";
import type { UmlEdgeData, UmlFlowEdge } from "@/components/edges/UmlEdge";
import { DiagramCanvas, type CanvasPresence } from "@/components/DiagramCanvas";
import { RemoteSelectionProvider } from "@/components/collab/RemoteSelectionContext";
import { Toolbar } from "@/components/Toolbar";
import { Inspector } from "@/components/Inspector";
import { InspectorResizer } from "@/components/InspectorResizer";
import {
  classesToFlowNodes,
  classToFlowNode,
  edgesToFlowEdges,
  flowToDiagram,
  isPackageNode,
  packagesToFlowNodes,
  packageToFlowNode,
  type AppFlowNode,
} from "@/lib/diagramToFlow";
import { createEmptyClass } from "@/lib/createClass";
import { createEmptyPackage } from "@/lib/createPackage";
import {
  loadDiagram,
  saveDiagram,
  loadViewPrefs,
  saveViewPrefs,
  clampInspectorWidth,
  loadInspectorWidth,
  saveInspectorWidth,
  INSPECTOR_DEFAULT_WIDTH,
} from "@/lib/storage";
import { exportDiagramJson } from "@/lib/jsonIo";
import { exportDiagramMarkdown } from "@/lib/exportMermaid";
import {
  DEFAULT_DISPLAY_PREFS,
  DisplayPrefsProvider,
  type DisplayPrefs,
} from "@/components/DisplayPrefsContext";
import {
  buildRoomUrl,
  consumeSeedFlag,
  generateRoomId,
  getRoomIdFromUrl,
  markSeedRoom,
  type UserIdentity,
} from "@/lib/collab/room";
import {
  useCollaborativeDiagram,
  type ConnectionStatus,
  type RemotePresence,
} from "@/lib/collab/useCollaborativeDiagram";

/** 新規クラスを少しずつずらして置くための基準オフセット。 */
const CASCADE_STEP = 36;
const CASCADE_ORIGIN = 80;

/**
 * 図の状態と操作の共通インターフェース。
 * ローカルモード（useNodesState）と共同編集モード（Yjs）のどちらも同じ形で提供し、
 * 下の DiagramEditorBody が中身を意識せずに使えるようにする。
 */
interface EditorStore {
  nodes: AppFlowNode[];
  edges: UmlFlowEdge[];
  onNodesChange: OnNodesChange<AppFlowNode>;
  onEdgesChange: OnEdgesChange<UmlFlowEdge>;
  setNodes: Dispatch<SetStateAction<AppFlowNode[]>>;
  setEdges: Dispatch<SetStateAction<UmlFlowEdge[]>>;
}

/** 共同編集時のプレゼンス連携。 */
interface PresenceApi {
  self: UserIdentity;
  remote: RemotePresence[];
  status: ConnectionStatus;
  setCursor: (pos: { x: number; y: number } | null) => void;
  setSelection: (id: string | null) => void;
}

/**
 * 図エディタの最上位。マウント時に URL の ?room=xxxx を見て、
 * あれば共同編集モード、無ければ従来のローカル単独モードを選ぶ。
 * room 判定はクライアントでのみ行うため、確定するまでは何も描かない
 * （SSR とのハイドレーション不一致を避ける）。
 */
export function DiagramEditor() {
  const [roomId, setRoomId] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // URL は SSR で読めないため、マウント後にクライアントで判定する。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRoomId(getRoomIdFromUrl());
  }, []);

  if (roomId === undefined) return null;
  return roomId ? <CollaborativeEditor roomId={roomId} /> : <LocalEditor />;
}

/** ローカル単独モード: 従来どおり localStorage で永続化する。 */
function LocalEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<AppFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<UmlFlowEdge>([]);
  // 復元完了までは保存しない（初期の空状態で保存データを上書きしないため）。
  const hydrated = useRef(false);

  // 初回マウント時に localStorage から復元する（SSR を避けてクライアントで実行）。
  useEffect(() => {
    const saved = loadDiagram();
    if (saved) {
      // パッケージを先頭に置き、クラスより背面に描画する。
      setNodes([...packagesToFlowNodes(saved), ...classesToFlowNodes(saved)]);
      setEdges(edgesToFlowEdges(saved));
    }
    hydrated.current = true;
  }, [setNodes, setEdges]);

  // ノード / エッジが変わるたびに Diagram へ変換して自動保存する。
  useEffect(() => {
    if (!hydrated.current) return;
    saveDiagram(flowToDiagram(nodes, edges));
  }, [nodes, edges]);

  const store: EditorStore = {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
  };
  return <DiagramEditorBody store={store} roomId={null} />;
}

/** 共同編集モード: Yjs 共有ドキュメントを正として同期する。 */
function CollaborativeEditor({ roomId }: { roomId: string }) {
  const collab = useCollaborativeDiagram(roomId);
  // 新規作成した部屋に、作成前の図を 1 度だけ引き継ぐ。
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current || !collab.synced) return;
    seededRef.current = true;
    // 既存の部屋に入っただけなら初期化しない（共有データを優先）。
    if (!consumeSeedFlag(roomId)) return;
    // 既に誰かが中身を入れていたら上書きしない。
    if (collab.nodes.length > 0 || collab.edges.length > 0) return;
    const local = loadDiagram();
    if (!local) return;
    collab.setNodes([
      ...packagesToFlowNodes(local),
      ...classesToFlowNodes(local),
    ]);
    collab.setEdges(edgesToFlowEdges(local));
  }, [collab, roomId]);

  const presence: PresenceApi = {
    self: collab.self,
    remote: collab.remote,
    status: collab.status,
    setCursor: collab.setCursor,
    setSelection: collab.setSelection,
  };

  return (
    <DiagramEditorBody store={collab} roomId={roomId} presence={presence} />
  );
}

/**
 * 3 ペイン（Toolbar / Canvas / Inspector）の本体。
 * ノード / エッジの編集操作は store 経由で行い、ローカル/共同編集の違いを吸収する。
 * 表示オプションと選択状態はユーザーごとのローカル状態として保持する。
 */
function DiagramEditorBody({
  store,
  roomId,
  presence,
}: {
  store: EditorStore;
  roomId: string | null;
  presence?: PresenceApi;
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, setNodes, setEdges } =
    store;
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPrefs>(
    DEFAULT_DISPLAY_PREFS
  );
  // 表示オプションはユーザーごとの設定。共有せず localStorage で個別に持つ。
  const prefsHydrated = useRef(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayPrefs(loadViewPrefs());
    prefsHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!prefsHydrated.current) return;
    saveViewPrefs(displayPrefs);
  }, [displayPrefs]);

  // インスペクタ幅も表示オプションと同じくユーザーごとのローカル設定。
  const [inspectorWidth, setInspectorWidth] = useState(INSPECTOR_DEFAULT_WIDTH);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInspectorWidth(loadInspectorWidth());
  }, []);
  // ドラッグ中は毎フレーム変わるため、書き込みは落ち着いてから 1 回だけにする。
  useEffect(() => {
    const timer = setTimeout(() => saveInspectorWidth(inspectorWidth), 300);
    return () => clearTimeout(timer);
  }, [inspectorWidth]);
  // 窓が狭くなったとき、キャンバスが潰れないよう幅を締め直す。
  useEffect(() => {
    const handleResize = () =>
      setInspectorWidth((current) => clampInspectorWidth(current));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 選択が変わったら他ユーザーへ知らせる（プレゼンス用）。
  const broadcastSelection = presence?.setSelection;
  useEffect(() => {
    broadcastSelection?.(selectedNodeId ?? selectedEdgeId ?? null);
  }, [broadcastSelection, selectedNodeId, selectedEdgeId]);

  // 「クラス追加」: 既存数に応じて少しずらした位置へ新規クラスを置く。
  const handleAddClass = useCallback(() => {
    setNodes((current) => {
      const offset = CASCADE_ORIGIN + (current.length % 8) * CASCADE_STEP;
      const newClass = createEmptyClass({ x: offset, y: offset });
      return [...current, classToFlowNode(newClass)];
    });
  }, [setNodes]);

  // 「パッケージ追加」: 先頭に差し込み、クラスより背面に置く。
  const handleAddPackage = useCallback(() => {
    setNodes((current) => {
      const offset = CASCADE_ORIGIN + (current.length % 8) * CASCADE_STEP;
      const newPackage = createEmptyPackage({ x: offset, y: offset });
      return [packageToFlowNode(newPackage), ...current];
    });
  }, [setNodes]);

  // Handle 同士の接続で関連線を作る。既定の種類は association（種類は Inspector で変更）。
  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      const newEdge: UmlFlowEdge = {
        id: crypto.randomUUID(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: "uml",
        data: { kind: "association" },
      };
      setEdges((current) => addEdge(newEdge, current));
    },
    [setEdges]
  );

  // 選択変更: 先頭の選択ノード / エッジをインスペクタ対象にする。
  const handleSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      setSelectedNodeId(selectedNodes[0]?.id ?? null);
      setSelectedEdgeId(selectedEdges[0]?.id ?? null);
    },
    []
  );

  // インスペクタからのクラス編集を該当ノードへ反映する（即時反映 → 同期 / 保存）。
  const updateClass = useCallback(
    (id: string, updater: (classNode: ClassNode) => ClassNode) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== id || isPackageNode(node)) return node;
          return { ...node, data: { classNode: updater(node.data.classNode) } };
        })
      );
    },
    [setNodes]
  );

  // クラス削除（接続している関連線も連動して取り除く）。
  const removeClass = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((node) => node.id !== id));
      setEdges((current) =>
        current.filter((edge) => edge.source !== id && edge.target !== id)
      );
      setSelectedNodeId((prev) => (prev === id ? null : prev));
    },
    [setNodes, setEdges]
  );

  // インスペクタからのパッケージ名編集を反映する。
  const updatePackage = useCallback(
    (id: string, changes: Partial<PackageNode>) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== id || !isPackageNode(node)) return node;
          return {
            ...node,
            data: { packageNode: { ...node.data.packageNode, ...changes } },
          };
        })
      );
    },
    [setNodes]
  );

  // パッケージ削除（見た目の枠のみ。関連線には影響しない）。
  const removePackage = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((node) => node.id !== id));
      setSelectedNodeId((prev) => (prev === id ? null : prev));
    },
    [setNodes]
  );

  // インスペクタからの関連編集（種類・関連名）を反映する。
  const updateEdge = useCallback(
    (id: string, changes: Partial<UmlEdgeData>) => {
      setEdges((current) =>
        current.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  ...changes,
                  kind: changes.kind ?? edge.data?.kind ?? "association",
                },
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  // 始点⇄終点を入れ替える（source/target と接続辺ハンドルをまとめて交換）。
  const swapEdgeDirection = useCallback(
    (id: string) => {
      setEdges((current) =>
        current.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                source: edge.target,
                target: edge.source,
                sourceHandle: edge.targetHandle,
                targetHandle: edge.sourceHandle,
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  const removeEdge = useCallback(
    (id: string) => {
      setEdges((current) => current.filter((edge) => edge.id !== id));
      setSelectedEdgeId((prev) => (prev === id ? null : prev));
    },
    [setEdges]
  );

  // 現在の図を JSON で書き出す。
  const handleExportJson = useCallback(() => {
    exportDiagramJson(flowToDiagram(nodes, edges));
  }, [nodes, edges]);

  // 現在の図を Mermaid 記法の Markdown で書き出す。
  const handleExportMarkdown = useCallback(() => {
    exportDiagramMarkdown(flowToDiagram(nodes, edges));
  }, [nodes, edges]);

  // 読み込んだ Diagram で現在の図を置き換える（同期 / 保存に乗る）。
  const handleImportDiagram = useCallback(
    (diagram: Diagram) => {
      // パッケージを先頭（背面）に置いてから読み込む。
      setNodes([
        ...packagesToFlowNodes(diagram),
        ...classesToFlowNodes(diagram),
      ]);
      setEdges(edgesToFlowEdges(diagram));
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    },
    [setNodes, setEdges]
  );

  // 表示オプションのトグル（static 下線 / abstract 斜体）。
  const toggleDisplayPref = useCallback((key: keyof DisplayPrefs) => {
    setDisplayPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 共有: 未参加なら現在の図を引き継いだ新しい部屋を作る。参加中ならリンクをコピー。
  const handleShare = useCallback(() => {
    if (roomId) {
      void navigator.clipboard?.writeText(window.location.href);
      window.alert(
        "共有リンクをコピーしました。\nこのリンクを知っている人が同時に編集できます。"
      );
      return;
    }
    const newRoom = generateRoomId();
    markSeedRoom(newRoom); // 現在の図を新しい部屋へ引き継ぐ印
    saveDiagram(flowToDiagram(nodes, edges)); // 引き継ぎ元を確定保存
    window.location.href = buildRoomUrl(newRoom);
  }, [roomId, nodes, edges]);

  // 選択中の要素を最新状態から引く（削除済みなら null）。
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedClass =
    selectedNode && !isPackageNode(selectedNode)
      ? selectedNode.data.classNode
      : null;
  const selectedPackage =
    selectedNode && isPackageNode(selectedNode)
      ? selectedNode.data.packageNode
      : null;
  const selectedEdgeFlow = edges.find((edge) => edge.id === selectedEdgeId);
  const nameOf = (id: string) => {
    // 関連線はクラス同士のみ接続するため、対象はクラスノード。
    const node = nodes.find((n) => n.id === id);
    return node && !isPackageNode(node) ? node.data.classNode.name : undefined;
  };
  const selectedEdge = selectedEdgeFlow
    ? {
        id: selectedEdgeFlow.id,
        kind: selectedEdgeFlow.data?.kind ?? "association",
        label: selectedEdgeFlow.data?.label,
        sourceName: nameOf(selectedEdgeFlow.source),
        targetName: nameOf(selectedEdgeFlow.target),
      }
    : null;

  const canvasPresence: CanvasPresence | undefined = presence
    ? { remote: presence.remote, onCursorMove: presence.setCursor }
    : undefined;

  // 他ユーザーの選択を「要素 id → 選択者一覧」にまとめ、各ノードへ配る。
  const remoteSelection = useMemo(() => {
    const map = new Map<string, RemotePresence[]>();
    for (const peer of presence?.remote ?? []) {
      if (!peer.selection) continue;
      const list = map.get(peer.selection);
      if (list) list.push(peer);
      else map.set(peer.selection, [peer]);
    }
    return map;
  }, [presence?.remote]);

  return (
    // Toolbar から useReactFlow（fitView）を使うため、全体を Provider で包む。
    // 表示オプションは Context でカスタムノードへ配る。
    <ReactFlowProvider>
      <DisplayPrefsProvider value={displayPrefs}>
       <RemoteSelectionProvider value={remoteSelection}>
        <div className="flex h-full w-full flex-col">
          <Toolbar
            onAddClass={handleAddClass}
            onAddPackage={handleAddPackage}
            onExportJson={handleExportJson}
            onExportMarkdown={handleExportMarkdown}
            onImportDiagram={handleImportDiagram}
            displayPrefs={displayPrefs}
            onToggleDisplayPref={toggleDisplayPref}
            isCollaborating={roomId !== null}
            connectionStatus={presence?.status}
            peerCount={presence?.remote.length ?? 0}
            onShare={handleShare}
          />
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1">
              <DiagramCanvas
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={handleConnect}
                onSelectionChange={handleSelectionChange}
                presence={canvasPresence}
              />
            </div>
            <InspectorResizer
              width={inspectorWidth}
              onResize={setInspectorWidth}
            />
            <Inspector
              width={inspectorWidth}
              selectedClass={selectedClass}
              selectedEdge={selectedEdge}
              selectedPackage={selectedPackage}
              onUpdateClass={updateClass}
              onRemoveClass={removeClass}
              onUpdateEdge={updateEdge}
              onSwapEdge={swapEdgeDirection}
              onRemoveEdge={removeEdge}
              onUpdatePackage={updatePackage}
              onRemovePackage={removePackage}
            />
          </div>
        </div>
       </RemoteSelectionProvider>
      </DisplayPrefsProvider>
    </ReactFlowProvider>
  );
}
