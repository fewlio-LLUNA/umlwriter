"use client";

import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

import { exportCanvasImage, type ImageFormat } from "@/lib/exportImage";

/**
 * 上部ツールバー（Phase 5）。
 *
 * クラス追加と画像書き出し（SVG / PNG）。書き出しは全体を fitView してから
 * マーカー定義を含む外側コンテナ（.uml-canvas）を画像化する。
 * 関連モード・JSON 入出力は後続フェーズ。
 */
export function Toolbar({ onAddClass }: { onAddClass: () => void }) {
  const { fitView } = useReactFlow();

  const handleExport = useCallback(
    async (format: ImageFormat) => {
      // まず全体を収め、描画が落ち着いてからコンテナを画像化する。
      fitView({ padding: 0.2, duration: 0 });
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      );
      const container = document.querySelector<HTMLElement>(".uml-canvas");
      if (container) {
        await exportCanvasImage(container, format);
      }
    },
    [fitView]
  );

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4">
      <span className="text-sm font-semibold text-slate-700">
        UML クラス図エディタ
      </span>
      <button
        type="button"
        onClick={onAddClass}
        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        ＋ クラス追加
      </button>
      <div className="ml-auto flex items-center gap-2">
        <span className="text-xs text-slate-400">画像書き出し</span>
        <button
          type="button"
          onClick={() => handleExport("svg")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          SVG
        </button>
        <button
          type="button"
          onClick={() => handleExport("png")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          PNG
        </button>
      </div>
    </header>
  );
}
