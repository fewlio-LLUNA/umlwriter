"use client";

import { useMemo } from "react";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
// React Flow のスタイル。これを読み込まないとキャンバスが真っ白になる。
import "@xyflow/react/dist/style.css";

import { ClassNode } from "@/components/nodes/ClassNode";
import { classesToFlowNodes } from "@/lib/diagramToFlow";
import { sampleDiagram } from "@/lib/sampleDiagram";

/**
 * カスタムノードの登録表。`type: "umlClass"` をクラスの箱に対応づける。
 * コンポーネント外で定義し、再レンダーのたびに作り直されないようにする。
 */
const nodeTypes = { umlClass: ClassNode };

/**
 * 作図キャンバス（Phase 1）。
 *
 * ClassNode をカスタムノードとして UML 3 段組で描画する。
 * 表示確認用のサンプル Diagram を変換して並べ、ドラッグ移動 / ズーム / パンを試せる。
 * 関連線（Edge）・追加 / 編集 UI は後続フェーズで追加する。
 */
export function DiagramCanvas() {
  // サンプル Diagram → React Flow ノードへ変換（サンプルは不変なので一度だけ）。
  const nodes = useMemo(() => classesToFlowNodes(sampleDiagram), []);

  return (
    <div className="h-full w-full">
      <ReactFlow nodes={nodes} edges={[]} nodeTypes={nodeTypes} fitView>
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
