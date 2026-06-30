"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type OnNodesChange,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
// React Flow のスタイル。これを読み込まないとキャンバスが真っ白になる。
import "@xyflow/react/dist/style.css";

import { ClassNode, type ClassFlowNode } from "@/components/nodes/ClassNode";

/**
 * カスタムノードの登録表。`type: "umlClass"` をクラスの箱に対応づける。
 * コンポーネント外で定義し、再レンダーのたびに作り直されないようにする。
 */
const nodeTypes = { umlClass: ClassNode };

/** Delete / Backspace のどちらでもノードを削除できるようにする。 */
const DELETE_KEY_CODES = ["Backspace", "Delete"];

/**
 * 作図キャンバス（Phase 2）。
 *
 * ノードの状態（追加 / 移動 / 削除 / 選択）は親（DiagramEditor）が握り、
 * ここは React Flow に制御ノードとして渡して描画と操作の受け口だけを担う。
 * 関連線（Edge）は後続フェーズで追加する。
 */
export function DiagramCanvas({
  nodes,
  onNodesChange,
  onSelectionChange,
}: {
  nodes: ClassFlowNode[];
  onNodesChange: OnNodesChange<ClassFlowNode>;
  onSelectionChange: OnSelectionChangeFunc;
}) {
  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={[]}
        onNodesChange={onNodesChange}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
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
