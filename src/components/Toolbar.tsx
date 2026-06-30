"use client";

/**
 * 上部ツールバー（Phase 2）。
 *
 * 設計（ui/toolbar.md）ではクラス追加・関連モード・入出力・画像書き出しが並ぶが、
 * Phase 2 では「クラス追加」のみを実装する。関連モード以降は後続フェーズで足す。
 */
export function Toolbar({ onAddClass }: { onAddClass: () => void }) {
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
    </header>
  );
}
