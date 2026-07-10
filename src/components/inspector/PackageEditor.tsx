"use client";

import type { PackageNode } from "@/types/diagram";
import { INPUT_CLASS } from "./controls";

/**
 * パッケージ（フォルダ型の枠）の編集フォーム。
 * 名前の編集と削除のみ。サイズ・位置はキャンバス上の操作で変える。
 */
export function PackageEditor({
  packageNode,
  onUpdate,
  onRemove,
}: {
  packageNode: PackageNode;
  onUpdate: (id: string, changes: Partial<PackageNode>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-xs text-slate-400">パッケージ</div>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-500">名前</span>
        <input
          type="text"
          value={packageNode.name}
          onChange={(e) => onUpdate(packageNode.id, { name: e.target.value })}
          className={INPUT_CLASS}
        />
      </label>

      <p className="text-xs leading-relaxed text-slate-400">
        左上のタブをドラッグすると移動、タブをクリックで選択します。選択中は
        角・辺のハンドルで大きさを変えられます。枠の内側のクラス・関連線は
        そのままクリックして編集できます。
      </p>

      <button
        type="button"
        onClick={() => onRemove(packageNode.id)}
        className="mt-2 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        パッケージを削除
      </button>
    </div>
  );
}
