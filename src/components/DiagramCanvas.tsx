"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
// React Flow のスタイル。これを読み込まないとキャンバスが真っ白になる。
import "@xyflow/react/dist/style.css";

import { ClassNode, type ClassFlowNode } from "@/components/nodes/ClassNode";
import { UmlEdge, type UmlFlowEdge } from "@/components/edges/UmlEdge";
import { MarkerDefs } from "@/components/edges/MarkerDefs";

/**
 * カスタムノード / エッジの登録表。コンポーネント外で定義し、
 * 再レンダーのたびに作り直されないようにする。
 */
const nodeTypes = { umlClass: ClassNode };
const edgeTypes = { uml: UmlEdge };

/** Delete / Backspace のどちらでもノード / エッジを削除できるようにする。 */
const DELETE_KEY_CODES = ["Backspace", "Delete"];

/**
 * 作図キャンバス（Phase 4）。
 *
 * ノード / エッジの状態（追加・移動・削除・選択・接続）は親（DiagramEditor）が握り、
 * ここは React Flow に制御値として渡して描画と操作の受け口だけを担う。
 * 4 辺の Handle 同士をドラッグでつなぐと関連線が作られる（ConnectionMode.Loose）。
 */
export function DiagramCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectionChange,
}: {
  nodes: ClassFlowNode[];
  edges: UmlFlowEdge[];
  onNodesChange: OnNodesChange<ClassFlowNode>;
  onEdgesChange: OnEdgesChange<UmlFlowEdge>;
  onConnect: OnConnect;
  onSelectionChange: OnSelectionChangeFunc;
}) {
  return (
    // uml-canvas: 画像書き出しの対象。マーカー定義と ReactFlow を内包する。
    <div className="uml-canvas h-full w-full">
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
        fitView
      >
        {/* 背景のドットグリッド */}
        <Background />
        {/* ズーム / フィット / ロックの操作ボタン */}
        <Controls />
        {/* 右下のミニマップ */}
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
