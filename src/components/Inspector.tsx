"use client";

import type { ClassNode } from "@/types/diagram";
import { ClassEditor } from "@/components/inspector/ClassEditor";

/**
 * 右側インスペクタ（Phase 3）。
 *
 * クラス未選択なら空状態の案内、選択中なら編集フォーム（ClassEditor）を出す。
 * 編集は即時反映（双方向バインド）で、保存は DiagramEditor 側の自動保存に乗る。
 * 関連（Edge）選択時の編集は後続フェーズで追加する。
 */
export function Inspector({
  selected,
  onUpdate,
  onRemove,
}: {
  selected: ClassNode | null;
  onUpdate: (id: string, updater: (c: ClassNode) => ClassNode) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-white p-4 text-sm">
      {selected ? (
        <ClassEditor
          classNode={selected}
          onUpdate={onUpdate}
          onRemove={onRemove}
        />
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
        キャンバスのクラスをクリックすると、ここで名前・ステレオタイプ・属性・操作を編集できます。
      </p>
    </div>
  );
}
