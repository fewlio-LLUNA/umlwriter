"use client";

import type {
  Attribute,
  ClassNode,
  Operation,
  Stereotype,
} from "@/types/diagram";
import { INPUT_CLASS } from "./controls";
import { AttributeRow } from "./AttributeRow";
import { OperationRow } from "./OperationRow";

/** ステレオタイプ 4 択の選択肢。 */
const STEREOTYPE_OPTIONS: { value: Stereotype; label: string }[] = [
  { value: "none", label: "通常" },
  { value: "abstract", label: "abstract" },
  { value: "interface", label: "interface" },
  { value: "enumeration", label: "enumeration" },
];

/** 新規属性 / 操作の既定値。 */
const newAttribute = (): Attribute => ({
  id: crypto.randomUUID(),
  visibility: "+",
  name: "field",
});
const newOperation = (): Operation => ({
  id: crypto.randomUUID(),
  visibility: "+",
  name: "method",
  parameters: [],
});

/**
 * 選択中クラスの編集フォーム（クラス名・ステレオタイプ・説明・属性・操作）。
 * 値はすべてモデルに即時反映する。引数の編集は OperationRow に委ねる。
 */
export function ClassEditor({
  classNode,
  onUpdate,
  onRemove,
}: {
  classNode: ClassNode;
  onUpdate: (id: string, updater: (c: ClassNode) => ClassNode) => void;
  onRemove: (id: string) => void;
}) {
  const update = (updater: (c: ClassNode) => ClassNode) =>
    onUpdate(classNode.id, updater);

  // 属性リストの増減・更新。
  const addAttribute = () =>
    update((c) => ({ ...c, attributes: [...c.attributes, newAttribute()] }));
  const updateAttribute = (index: number, next: Attribute) =>
    update((c) => ({
      ...c,
      attributes: c.attributes.map((a, i) => (i === index ? next : a)),
    }));
  const removeAttribute = (index: number) =>
    update((c) => ({
      ...c,
      attributes: c.attributes.filter((_, i) => i !== index),
    }));

  // 操作リストの増減・更新。
  const addOperation = () =>
    update((c) => ({ ...c, operations: [...c.operations, newOperation()] }));
  const updateOperation = (index: number, next: Operation) =>
    update((c) => ({
      ...c,
      operations: c.operations.map((o, i) => (i === index ? next : o)),
    }));
  const removeOperation = (index: number) =>
    update((c) => ({
      ...c,
      operations: c.operations.filter((_, i) => i !== index),
    }));

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      {/* クラス本体 */}
      <section className="flex flex-col gap-2">
        <Field label="クラス名">
          <input
            type="text"
            value={classNode.name}
            onChange={(e) => update((c) => ({ ...c, name: e.target.value }))}
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="ステレオタイプ">
          <select
            value={classNode.stereotype}
            onChange={(e) =>
              update((c) => ({
                ...c,
                stereotype: e.target.value as Stereotype,
              }))
            }
            className={INPUT_CLASS}
          >
            {STEREOTYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="説明">
          <input
            type="text"
            value={classNode.description ?? ""}
            onChange={(e) =>
              update((c) => ({
                ...c,
                description: e.target.value || undefined,
              }))
            }
            placeholder="任意（例: 本クラス）"
            className={INPUT_CLASS}
          />
        </Field>
      </section>

      {/* 属性 */}
      <ListSection title="属性" addLabel="＋ 属性追加" onAdd={addAttribute}>
        {classNode.attributes.map((attribute, index) => (
          <AttributeRow
            key={attribute.id}
            attribute={attribute}
            onChange={(next) => updateAttribute(index, next)}
            onRemove={() => removeAttribute(index)}
          />
        ))}
      </ListSection>

      {/* 操作 */}
      <ListSection title="操作" addLabel="＋ 操作追加" onAdd={addOperation}>
        {classNode.operations.map((operation, index) => (
          <OperationRow
            key={operation.id}
            operation={operation}
            onChange={(next) => updateOperation(index, next)}
            onRemove={() => removeOperation(index)}
          />
        ))}
      </ListSection>

      {/* クラス削除 */}
      <button
        type="button"
        onClick={() => onRemove(classNode.id)}
        className="mt-2 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        クラスを削除
      </button>
    </div>
  );
}

/** ラベル付きの 1 項目（縦並び）。 */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  );
}

/** 見出し＋追加ボタン付きのリスト枠（属性・操作で共通）。 */
function ListSection({
  title,
  addLabel,
  onAdd,
  children,
}: {
  title: string;
  addLabel: string;
  onAdd: () => void;
  children: React.ReactNode[];
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">{title}</span>
        <button
          type="button"
          onClick={onAdd}
          className="rounded px-2 py-0.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
        >
          {addLabel}
        </button>
      </div>
      {children.length > 0 ? (
        <ul className="flex flex-col gap-1.5">{children}</ul>
      ) : (
        <p className="text-xs text-slate-400">（なし）</p>
      )}
    </section>
  );
}
