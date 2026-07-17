"use client";

import { useCallback, useRef } from "react";
import { useReactFlow } from "@xyflow/react";

import type { Diagram } from "@/types/diagram";
import type { DisplayPrefs } from "@/components/DisplayPrefsContext";
import type { ConnectionStatus } from "@/lib/collab/useCollaborativeDiagram";
import { exportCanvasImage, type ImageFormat } from "@/lib/exportImage";
import { readDiagramFile } from "@/lib/jsonIo";

/**
 * 上部ツールバー（Phase 6）。
 *
 * クラス追加・JSON 入出力・画像書き出し（SVG / PNG）・Mermaid Markdown 書き出し。
 * 画像書き出しは全体を fitView してからマーカー定義を含む外側コンテナ（.uml-canvas）を
 * 画像化する。JSON 読み込みは検証 OK のときだけ確認の上で現在の図を置き換える。
 */
export function Toolbar({
  onAddClass,
  onAddPackage,
  onExportJson,
  onExportMarkdown,
  onImportDiagram,
  displayPrefs,
  onToggleDisplayPref,
  isCollaborating,
  connectionStatus,
  peerCount,
  onShare,
}: {
  onAddClass: () => void;
  onAddPackage: () => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  onImportDiagram: (diagram: Diagram) => void;
  displayPrefs: DisplayPrefs;
  onToggleDisplayPref: (key: keyof DisplayPrefs) => void;
  /** 共同編集モード（room に参加中）か。 */
  isCollaborating: boolean;
  /** 接続状態（共同編集時のみ）。 */
  connectionStatus?: ConnectionStatus;
  /** 自分以外の参加人数（共同編集時のみ）。 */
  peerCount: number;
  /** 共有: room 未参加なら作成、参加中ならリンクをコピー。 */
  onShare: () => void;
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
      <button
        type="button"
        onClick={onAddPackage}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        ＋ パッケージ追加
      </button>

      {/* 共有: 未参加なら部屋を作成、参加中ならリンクをコピー */}
      <button
        type="button"
        onClick={onShare}
        className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
      >
        {isCollaborating ? "🔗 リンクをコピー" : "🔗 共有して同時編集"}
      </button>
      {isCollaborating && (
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <span
            className={
              connectionStatus === "connected"
                ? "inline-block h-2 w-2 rounded-full bg-emerald-500"
                : "inline-block h-2 w-2 rounded-full bg-amber-400"
            }
          />
          {connectionStatus === "connected" ? "接続中" : "接続待ち"}
          {peerCount > 0 && `・他 ${peerCount} 人`}
        </span>
      )}

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

        <span className="ml-2 text-xs text-slate-400">Markdown</span>
        <button
          type="button"
          onClick={onExportMarkdown}
          title="Mermaid 記法の .md として書き出す"
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Mermaid
        </button>
      </div>
    </header>
  );
}
