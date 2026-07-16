"use client";

import type { Visibility } from "@/types/diagram";

/** インスペクタ内の入力欄で共通利用する Tailwind クラス。 */
export const INPUT_CLASS =
  "w-full rounded border border-slate-300 px-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none";

/** 可視性セレクトの選択肢（記号と意味）。 */
const VISIBILITY_OPTIONS: { value: Visibility; label: string }[] = [
  { value: "+", label: "+ public" },
  { value: "-", label: "- private" },
  { value: "#", label: "# protected" },
  { value: "~", label: "~ package" },
];

/** 可視性 4 択セレクト。 */
export function VisibilitySelect({
  value,
  onChange,
}: {
  value: Visibility;
  onChange: (value: Visibility) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Visibility)}
      className="rounded border border-slate-300 px-1 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
      aria-label="可視性"
    >
      {VISIBILITY_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * 行頭のドラッグ用グリップ。属性・操作の行で共通利用する。
 * これを押している間だけ行が draggable になる（行内の入力欄の選択を壊さないため）。
 */
export function DragHandle({
  onPointerDown,
  onPointerUp,
}: {
  onPointerDown: () => void;
  onPointerUp: () => void;
}) {
  return (
    <span
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      className="shrink-0 cursor-grab select-none px-0.5 text-sm leading-none text-slate-300 hover:text-slate-500 active:cursor-grabbing"
      title="ドラッグで並び替え"
      aria-hidden="true"
    >
      ⠿
    </span>
  );
}

/** 行末の削除ボタン（属性・操作の行で共通利用）。 */
export function RemoveRowButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded px-1.5 text-xs text-slate-400 hover:bg-red-50 hover:text-red-600"
      aria-label="この行を削除"
      title="削除"
    >
      ✕
    </button>
  );
}
