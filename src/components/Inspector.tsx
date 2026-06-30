"use client";

import type { ClassNode } from "@/types/diagram";
import type { UmlEdgeData } from "@/components/edges/UmlEdge";
import { ClassEditor } from "@/components/inspector/ClassEditor";
import { EdgeEditor, type SelectedEdge } from "@/components/inspector/EdgeEditor";

/**
 * 右側インスペクタ（Phase 4）。
 *
 * 選択対象に応じて編集フォームを切り替える: クラス選択 → ClassEditor、
 * 関連線選択 → EdgeEditor、未選択 → 空状態。編集は即時反映（双方向バインド）で、
 * 保存は DiagramEditor 側の自動保存に乗る。
 */
export function Inspector({
  selectedClass,
  selectedEdge,
  onUpdateClass,
  onRemoveClass,
  onUpdateEdge,
  onSwapEdge,
  onRemoveEdge,
}: {
  selectedClass: ClassNode | null;
  selectedEdge: SelectedEdge | null;
  onUpdateClass: (id: string, updater: (c: ClassNode) => ClassNode) => void;
  onRemoveClass: (id: string) => void;
  onUpdateEdge: (id: string, changes: Partial<UmlEdgeData>) => void;
  onSwapEdge: (id: string) => void;
  onRemoveEdge: (id: string) => void;
}) {
  return (
    <aside className="flex w-80 shrink-0 flex-col gap-3 overflow-y-auto border-l border-slate-200 bg-white p-4 text-sm">
      {selectedClass ? (
        <ClassEditor
          classNode={selectedClass}
          onUpdate={onUpdateClass}
          onRemove={onRemoveClass}
        />
      ) : selectedEdge ? (
        <EdgeEditor
          edge={selectedEdge}
          onUpdate={onUpdateEdge}
          onSwap={onSwapEdge}
          onRemove={onRemoveEdge}
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
      <p className="font-medium text-slate-600">クラス / 関連を選択して編集</p>
      <p className="mt-1 text-xs leading-relaxed">
        クラスをクリックすると名前・属性・操作を、関連線をクリックすると種類・関連名を編集できます。
        クラスの辺からドラッグすると関連線を引けます。
      </p>
    </div>
  );
}
