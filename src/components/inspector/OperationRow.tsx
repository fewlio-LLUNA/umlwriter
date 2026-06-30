"use client";

import { useState } from "react";

import type { Operation } from "@/types/diagram";
import { formatParameters, parseParameters } from "@/lib/umlFormat";
import { INPUT_CLASS, RemoveRowButton, VisibilitySelect } from "./controls";

/**
 * 操作 1 件の編集 UI。
 * 〔可視性〕〔名前〕〔戻り型〕／〔引数〕〔static〕〔abstract〕〔削除〕。
 *
 * 引数だけは `name: type, ...` のテキストで編集する。入力中の再整形による
 * カーソルのジャンクを避けるため、生テキストを行内ローカル state で保持し、
 * 解析結果のみをモデルへ反映する（行は operation.id で key 付けされ、
 * 別クラス選択時に再マウントされて初期化される）。
 */
export function OperationRow({
  operation,
  onChange,
  onRemove,
}: {
  operation: Operation;
  onChange: (next: Operation) => void;
  onRemove: () => void;
}) {
  const [paramsText, setParamsText] = useState(() =>
    formatParameters(operation.parameters)
  );

  const handleParamsChange = (text: string) => {
    setParamsText(text);
    onChange({ ...operation, parameters: parseParameters(text) });
  };

  return (
    <li className="flex flex-col gap-1 rounded border border-slate-100 p-1.5">
      <div className="flex items-center gap-1">
        <VisibilitySelect
          value={operation.visibility}
          onChange={(visibility) => onChange({ ...operation, visibility })}
        />
        <input
          type="text"
          value={operation.name}
          onChange={(e) => onChange({ ...operation, name: e.target.value })}
          placeholder="名前"
          className={INPUT_CLASS}
          aria-label="操作名"
        />
        <input
          type="text"
          value={operation.returnType ?? ""}
          onChange={(e) =>
            onChange({ ...operation, returnType: e.target.value || undefined })
          }
          placeholder="戻り型"
          className={INPUT_CLASS}
          aria-label="戻り型"
        />
        <RemoveRowButton onClick={onRemove} />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={paramsText}
          onChange={(e) => handleParamsChange(e.target.value)}
          placeholder="引数（例: id: String, name: String）"
          className={INPUT_CLASS}
          aria-label="引数"
        />
        <label className="flex shrink-0 items-center gap-0.5 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={operation.isStatic ?? false}
            onChange={(e) =>
              onChange({ ...operation, isStatic: e.target.checked || undefined })
            }
          />
          static
        </label>
        <label className="flex shrink-0 items-center gap-0.5 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={operation.isAbstract ?? false}
            onChange={(e) =>
              onChange({
                ...operation,
                isAbstract: e.target.checked || undefined,
              })
            }
          />
          abstract
        </label>
      </div>
    </li>
  );
}
