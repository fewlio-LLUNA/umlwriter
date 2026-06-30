"use client";

import type { ClassNode } from "@/types/diagram";
import { stereotypeLabel } from "@/lib/umlFormat";

/**
 * 右側インスペクタ（Phase 2）。
 *
 * 設計（ui/inspector.md）では選択要素の編集フォームを出すが、Phase 2 では
 * 「未選択の空状態」と「選択中クラスの読み取り表示」までに留める。
 * 名前・ステレオタイプ・属性/操作の編集フォームは次フェーズで実装する。
 */
export function Inspector({ selected }: { selected: ClassNode | null }) {
  return (
    <aside className="flex w-72 shrink-0 flex-col gap-3 border-l border-slate-200 bg-white p-4 text-sm">
      {selected ? (
        <SelectedClassView classNode={selected} />
      ) : (
        <EmptyState />
      )}
    </aside>
  );
}

/** 未選択時の案内。 */
function EmptyState() {
  return (
    <div className="text-slate-500">
      <p className="font-medium text-slate-600">クラスを選択して編集</p>
      <p className="mt-1 text-xs leading-relaxed">
        キャンバスのクラスをクリックすると、ここに詳細が表示されます。
        編集フォームは次フェーズで追加予定です。
      </p>
    </div>
  );
}

/** 選択中クラスの読み取り表示（編集は次フェーズ）。 */
function SelectedClassView({ classNode }: { classNode: ClassNode }) {
  const label = stereotypeLabel(classNode.stereotype);
  return (
    <div className="flex flex-col gap-2">
      <div>
        <div className="text-xs text-slate-400">クラス</div>
        {label && <div className="text-xs text-slate-500">{label}</div>}
        <div className="text-base font-semibold text-slate-800">
          {classNode.name}
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-1 text-xs text-slate-600">
        <dt className="text-slate-400">属性</dt>
        <dd>{classNode.attributes.length} 件</dd>
        <dt className="text-slate-400">操作</dt>
        <dd>{classNode.operations.length} 件</dd>
      </dl>
      <p className="text-xs text-slate-400">
        削除は Delete / Backspace キー。編集フォームは次フェーズで追加予定です。
      </p>
    </div>
  );
}
