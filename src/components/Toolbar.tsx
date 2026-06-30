"use client";

import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

import type { Diagram } from "@/types/diagram";
import type { DisplayPrefs } from "@/components/DisplayPrefsContext";
import { exportCanvasImage, type ImageFormat } from "@/lib/exportImage";
import { readDiagramFile } from "@/lib/jsonIo";

/**
 * 上部ツールバー（Phase 6）。
 *
 * クラス追加・JSON 入出力・画像書き出し（SVG / PNG）。書き出しは全体を fitView
 * してからマーカー定義を含む外側コンテナ（.uml-canvas）を画像化する。
 * JSON 読み込みは検証 OK のときだけ確認の上で現在の図を置き換える。
 */
export function Toolbar({
  onAddClass,
  onExportJson,
  onImportDiagram,
  displayPrefs,
  onToggleDisplayPref,
}: {
  onAddClass: () => void;
  onExportJson: () => void;
  onImportDiagram: (diagram: Diagram) => void;
  displayPrefs: DisplayPrefs;
  onToggleDisplayPref: (key: keyof DisplayPrefs) => void;
}) {
  const { fitView } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportImage = useCallback(
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

  // ファイル選択 → 検証 → 確認 → 置き換え。
  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = ""; // 同じファイルを再選択できるようにする
      if (!file) return;
      try {
        const diagram = await readDiagramFile(file);
        if (window.confirm("読み込むと現在の図は置き換わります。続けますか？")) {
          onImportDiagram(diagram);
        }
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "読み込みに失敗しました。"
        );
      }
    },
    [onImportDiagram]
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

      {/* 表示オプション: static 下線 / abstract 斜体の表示切替（既定 ON） */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-slate-400">表示</span>
        <label className="flex items-center gap-1 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={displayPrefs.showStaticUnderline}
            onChange={() => onToggleDisplayPref("showStaticUnderline")}
          />
          static 下線
        </label>
        <label className="flex items-center gap-1 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={displayPrefs.showAbstractItalic}
            onChange={() => onToggleDisplayPref("showAbstractItalic")}
          />
          abstract 斜体
        </label>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">JSON</span>
        <button
          type="button"
          onClick={onExportJson}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          書き出し
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          読み込み
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChange}
          className="hidden"
        />

        <span className="ml-2 text-xs text-slate-400">画像</span>
        <button
          type="button"
          onClick={() => handleExportImage("svg")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          SVG
        </button>
        <button
          type="button"
          onClick={() => handleExportImage("png")}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          PNG
        </button>
      </div>
    </header>
  );
}
