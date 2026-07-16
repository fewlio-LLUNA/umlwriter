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
 * 行の並び替えボタン（▲▼）。属性・操作の行で共通利用する。
 * 端の行では対応する方向を disabled にして、順序の限界を見た目で示す。
 */
export function ReorderRowButtons({
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-col">
      <ReorderButton
        onClick={onMoveUp}
        disabled={!canMoveUp}
        label="上へ移動"
        glyph="▲"
      />
      <ReorderButton
        onClick={onMoveDown}
        disabled={!canMoveDown}
        label="下へ移動"
        glyph="▼"
      />
    </div>
  );
}

/** 並び替えボタン 1 個（▲ / ▼）。 */
function ReorderButton({
  onClick,
  disabled,
  label,
  glyph,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  glyph: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded px-1 text-[8px] leading-[1.4] text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-default disabled:text-slate-200 disabled:hover:bg-transparent"
      aria-label={label}
      title={label}
    >
      {glyph}
    </button>
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
