"use client";

import { useState, type DragEvent } from "react";

/** 並び替え対象の行 1 つに渡すバインディング一式。 */
export interface SortableRowBindings {
  /** 行の要素（li）に展開する props。 */
  rowProps: {
    draggable: boolean;
    onDragStart: (e: DragEvent<HTMLElement>) => void;
    onDragOver: (e: DragEvent<HTMLElement>) => void;
    onDragEnd: () => void;
    onDrop: () => void;
  };
  /** グリップハンドルに展開する props。 */
  handleProps: {
    onPointerDown: () => void;
    onPointerUp: () => void;
  };
  /** この行自身をドラッグ中か（淡色化に使う）。 */
  isDragging: boolean;
  /** この行の上端に挿入線を出すか。 */
  showDropLineBefore: boolean;
  /** この行の下端に挿入線を出すか。 */
  showDropLineAfter: boolean;
}

/**
 * リスト行のドラッグ&ドロップ並び替え。行の index を受けてバインディングを返す関数を返す。
 *
 * 行全体を draggable にすると行内の入力欄でテキスト選択ができなくなるため、
 * グリップハンドルを押している間だけ draggable を有効にする。
 *
 * 並び替えの確定はドロップ時の 1 回だけで、ドラッグ中はモデルを書き換えない
 * （共同編集の共有ドキュメントへの書き込みを 1 回に抑えるため）。
 */
export function useSortableList(onReorder: (from: number, to: number) => void) {
  const [handleHeld, setHandleHeld] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setHandleHeld(false);
    setDragIndex(null);
    setOverIndex(null);
  };

  return (index: number): SortableRowBindings => ({
    rowProps: {
      draggable: handleHeld,
      onDragStart: (e) => {
        // Firefox はデータをセットしないとドラッグを開始しない。
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(index));
        setDragIndex(index);
      },
      onDragOver: (e) => {
        if (dragIndex === null) return;
        e.preventDefault(); // 既定では drop が禁止されるため許可する。
        e.dataTransfer.dropEffect = "move";
        setOverIndex(index);
      },
      onDragEnd: reset,
      onDrop: () => {
        if (dragIndex !== null && overIndex !== null) {
          onReorder(dragIndex, overIndex);
        }
        reset();
      },
    },
    handleProps: {
      onPointerDown: () => setHandleHeld(true),
      onPointerUp: () => setHandleHeld(false),
    },
    isDragging: dragIndex === index,
    // 上へ運ぶならその行の手前、下へ運ぶならその行の後ろに挿入される。
    showDropLineBefore:
      dragIndex !== null && overIndex === index && index < dragIndex,
    showDropLineAfter:
      dragIndex !== null && overIndex === index && index > dragIndex,
  });
}

/** ドラッグ中の見た目（挿入線・淡色化）を表す Tailwind クラス。 */
export function sortableRowClass(bindings: SortableRowBindings): string {
  return [
    bindings.isDragging ? "opacity-40" : "",
    bindings.showDropLineBefore ? "border-t-2 border-t-blue-400" : "",
    bindings.showDropLineAfter ? "border-b-2 border-b-blue-400" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * 配列の要素を from から to へ移動した新しい配列を返す。
 * 添字が範囲外・移動なしのときは元の配列をそのまま返す。
 */
export function reorderItems<T>(items: T[], from: number, to: number): T[] {
  if (from === to) return items;
  if (from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return items;
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
