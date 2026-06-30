"use client";

import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
// React Flow のスタイル。これを読み込まないとキャンバスが真っ白になる。
import "@xyflow/react/dist/style.css";

/**
 * 空の作図キャンバス（Phase 0）。
 *
 * ノード・エッジは未登録（空配列）で、ズーム / パンのみ動作確認できる状態。
 * クラス追加・関連線などの機能は後続フェーズで追加する。
 */
export function DiagramCanvas() {
  return (
    <div className="h-full w-full">
      <ReactFlow nodes={[]} edges={[]} fitView>
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
