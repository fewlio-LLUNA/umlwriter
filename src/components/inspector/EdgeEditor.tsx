"use client";

import type { RelationKind } from "@/types/diagram";
import type { UmlEdgeData } from "@/components/edges/UmlEdge";
import { INPUT_CLASS } from "./controls";

/** 選択中の関連線の編集対象（最小限）。 */
export interface SelectedEdge {
  id: string;
  kind: RelationKind;
  label?: string;
  /** 始点 / 終点クラスの表示名（向きの確認・反転 UI 用）。 */
  sourceName?: string;
  targetName?: string;
}

/** 関連の種類セレクトの選択肢（記法表に対応）。 */
const KIND_OPTIONS: { value: RelationKind; label: string }[] = [
  { value: "association", label: "関連 (association)" },
  { value: "aggregation", label: "集約 (aggregation)" },
  { value: "composition", label: "コンポジション (composition)" },
  { value: "generalization", label: "汎化 (generalization)" },
  { value: "realization", label: "実現 (realization)" },
  { value: "dependency", label: "依存 (dependency)" },
];

/**
 * 関連線（Edge）の編集フォーム。
 * 種類セレクト（6 択・即座に描き替え）と関連名、削除ボタンまで。
 * 多重度・ロールはデータ器のみで UI は次の波。
 */
export function EdgeEditor({
  edge,
  onUpdate,
  onSwap,
  onRemove,
}: {
  edge: SelectedEdge;
  onUpdate: (id: string, changes: Partial<UmlEdgeData>) => void;
  onSwap: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-slate-400">関連線</div>

      {/* 向き（始点 → 終点）。種類によってマーカーの付く側が変わるため明示する。 */}
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">向き</span>
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <span className="truncate">{edge.sourceName ?? "始点"}</span>
          <span className="text-slate-400">→</span>
          <span className="truncate">{edge.targetName ?? "終点"}</span>
        </div>
        <button
          type="button"
          onClick={() => onSwap(edge.id)}
          className="mt-1 self-start rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
        >
          ⇄ 始点と終点を入れ替え
        </button>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">種類</span>
        <select
          value={edge.kind}
          onChange={(e) =>
            onUpdate(edge.id, { kind: e.target.value as RelationKind })
          }
          className={INPUT_CLASS}
        >
          {KIND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">関連名</span>
        <input
          type="text"
          value={edge.label ?? ""}
          onChange={(e) =>
            onUpdate(edge.id, { label: e.target.value || undefined })
          }
          placeholder="任意"
          className={INPUT_CLASS}
        />
      </label>
      <button
        type="button"
        onClick={() => onRemove(edge.id)}
        className="mt-2 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        関連を削除
      </button>
    </div>
  );
}
