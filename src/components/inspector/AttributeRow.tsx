"use client";

import type { Attribute } from "@/types/diagram";
import { DragHandle, INPUT_CLASS, RemoveRowButton, VisibilitySelect } from "./controls";
import { sortableRowClass, type SortableRowBindings } from "./useSortableList";

/**
 * 属性 1 行の編集 UI。
 * 〔グリップ〕〔可視性〕〔名前〕〔型〕〔static〕〔削除〕。値は親（モデル）に即時反映する。
 * 並び替えはグリップのドラッグ&ドロップで行う（バインディングは親が index 単位で作る）。
 */
export function AttributeRow({
  attribute,
  onChange,
  onRemove,
  sortable,
}: {
  attribute: Attribute;
  onChange: (next: Attribute) => void;
  onRemove: () => void;
  sortable: SortableRowBindings;
}) {
  return (
    <li
      {...sortable.rowProps}
      className={`flex items-center gap-1 rounded border-y-2 border-transparent ${sortableRowClass(sortable)}`}
    >
      <DragHandle {...sortable.handleProps} />
      <VisibilitySelect
        value={attribute.visibility}
        onChange={(visibility) => onChange({ ...attribute, visibility })}
      />
      <input
        type="text"
        value={attribute.name}
        onChange={(e) => onChange({ ...attribute, name: e.target.value })}
        placeholder="名前"
        className={INPUT_CLASS}
        aria-label="属性名"
      />
      <input
        type="text"
        value={attribute.type ?? ""}
        onChange={(e) =>
          onChange({ ...attribute, type: e.target.value || undefined })
        }
        placeholder="型"
        className={INPUT_CLASS}
        aria-label="型"
      />
      <label className="flex shrink-0 items-center gap-0.5 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={attribute.isStatic ?? false}
          onChange={(e) =>
            onChange({ ...attribute, isStatic: e.target.checked || undefined })
          }
        />
        static
      </label>
      <RemoveRowButton onClick={onRemove} />
    </li>
  );
}
