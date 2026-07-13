"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
// React Flow のスタイル。これを読み込まないとキャンバスが真っ白になる。
import "@xyflow/react/dist/style.css";

import { ClassNode } from "@/components/nodes/ClassNode";
import { PackageNode } from "@/components/nodes/PackageNode";
import { UmlEdge, type UmlFlowEdge } from "@/components/edges/UmlEdge";
import { MarkerDefs } from "@/components/edges/MarkerDefs";
import { PresenceLayer } from "@/components/collab/PresenceLayer";
import type { AppFlowNode } from "@/lib/diagramToFlow";
import type { RemotePresence } from "@/lib/collab/useCollaborativeDiagram";

/**
 * カスタムノード / エッジの登録表。コンポーネント外で定義し、
 * 再レンダーのたびに作り直されないようにする。
 */
const nodeTypes = { umlClass: ClassNode, umlPackage: PackageNode };
const edgeTypes = { uml: UmlEdge };

/** Delete / Backspace のどちらでもノード / エッジを削除できるようにする。 */
const DELETE_KEY_CODES = ["Backspace", "Delete"];

/** 共同編集用のプレゼンス連携（ローカル単独モードでは undefined）。 */
export interface CanvasPresence {
  /** 他ユーザーのカーソル一覧。 */
  remote: RemotePresence[];
  /** 自分のカーソル位置（フロー座標）を通知する。離脱時は null。 */
  onCursorMove: (pos: { x: number; y: number } | null) => void;
}

/**
 * 作図キャンバス（Phase 4）。
 *
 * ノード / エッジの状態（追加・移動・削除・選択・接続）は親（DiagramEditor）が握り、
 * ここは React Flow に制御値として渡して描画と操作の受け口だけを担う。
 * 4 辺の Handle 同士をドラッグでつなぐと関連線が作られる（ConnectionMode.Loose）。
 * 共同編集モードでは他ユーザーのカーソルを重ね描きする。
 */
export function DiagramCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
  presence,
}: {
  nodes: AppFlowNode[];
  edges: UmlFlowEdge[];
  onNodesChange: OnNodesChange<AppFlowNode>;
  onEdgesChange: OnEdgesChange<UmlFlowEdge>;
  onConnect: OnConnect;
  onSelectionChange: OnSelectionChangeFunc;
  presence?: CanvasPresence;
}) {
  const { screenToFlowPosition } = useReactFlow();
  // カーソル通知を毎フレームに間引くための保留 rAF。
  const rafRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!presence) return;
      const { clientX, clientY } = event;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        presence.onCursorMove(
          screenToFlowPosition({ x: clientX, y: clientY })
        );
      });
    },
    [presence, screenToFlowPosition]
  );

  const handleMouseLeave = useCallback(() => {
    presence?.onCursorMove(null);
  }, [presence]);

  return (
    // uml-canvas: 画像書き出しの対象。マーカー定義と ReactFlow を内包する。
    <div
      className="uml-canvas h-full w-full"
      onMouseMove={presence ? handleMouseMove : undefined}
      onMouseLeave={presence ? handleMouseLeave : undefined}
    >
      {/* エッジが参照する SVG マーカー定義（画面に 1 度だけ） */}
      <MarkerDefs />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={DELETE_KEY_CODES}
        // パッケージを選択しても前面化させず、背面のまま重なるクラスを操作可能に保つ
        elevateNodesOnSelect={false}
        fitView
      >
        {/* 背景のドットグリッド */}
        <Background />
        {/* ズーム / フィット / ロックの操作ボタン */}
        <Controls />
        {/* 右下のミニマップ */}
        <MiniMap />
        {/* 共同編集: 他ユーザーのカーソル */}
        {presence && <PresenceLayer remote={presence.remote} />}
      </ReactFlow>
    </div>
  );
}
