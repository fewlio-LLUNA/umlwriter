"use client";

import type { Attribute } from "@/types/diagram";
import {
  INPUT_CLASS,
  RemoveRowButton,
  ReorderRowButtons,
  VisibilitySelect,
} from "./controls";

/**
 * 属性 1 行の編集 UI。
 * 〔可視性〕〔名前〕〔型〕〔static〕〔並び替え〕〔削除〕。値は親（モデル）に即時反映する。
 */
export function AttributeRow({
  attribute,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: {
  attribute: Attribute;
  onChange: (next: Attribute) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  return (
    <li className="flex items-center gap-1">
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
      <ReorderRowButtons
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
      />
      <RemoveRowButton onClick={onRemove} />
    </li>
  );
}
