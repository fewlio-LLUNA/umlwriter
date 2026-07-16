"use client";

import { useCallback, type KeyboardEvent, type PointerEvent } from "react";

import {
  clampInspectorWidth,
  INSPECTOR_DEFAULT_WIDTH,
  INSPECTOR_MAX_WIDTH,
  INSPECTOR_MIN_WIDTH,
} from "@/lib/storage";

/** キーボード操作 1 回で変える幅（px）。 */
const KEYBOARD_STEP = 16;

/**
 * キャンバスとインスペクタの境界に置く縦スプリッター。
 *
 * 左へドラッグするとインスペクタが広がる。ダブルクリックで既定幅に戻す。
 * ドラッグ中はポインタキャプチャを取り、キャンバス（React Flow）側に
 * ポインタイベントを奪われないようにする。
 */
export function InspectorResizer({
  width,
  onResize,
}: {
  width: number;
  onResize: (width: number) => void;
}) {
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const handle = e.currentTarget;
      const startX = e.clientX;
      const startWidth = width;
      handle.setPointerCapture(e.pointerId);

      // 左へ動かすほど広がるので、移動量は startX からの引き算で取る。
      const handleMove = (ev: globalThis.PointerEvent) =>
        onResize(clampInspectorWidth(startWidth + (startX - ev.clientX)));
      const handleUp = (ev: globalThis.PointerEvent) => {
        handle.releasePointerCapture(ev.pointerId);
        handle.removeEventListener("pointermove", handleMove);
        handle.removeEventListener("pointerup", handleUp);
      };
      handle.addEventListener("pointermove", handleMove);
      handle.addEventListener("pointerup", handleUp);
    },
    [width, onResize]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      onResize(clampInspectorWidth(width + KEYBOARD_STEP));
    } else if (e.key === "ArrowRight") {
      onResize(clampInspectorWidth(width - KEYBOARD_STEP));
    } else if (e.key === "Home") {
      onResize(clampInspectorWidth(INSPECTOR_DEFAULT_WIDTH));
    } else {
      return;
    }
    e.preventDefault();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="インスペクタの幅を変更"
      aria-valuenow={width}
      aria-valuemin={INSPECTOR_MIN_WIDTH}
      aria-valuemax={INSPECTOR_MAX_WIDTH}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onDoubleClick={() => onResize(INSPECTOR_DEFAULT_WIDTH)}
      onKeyDown={handleKeyDown}
      title="ドラッグで幅を変更（ダブルクリックで既定幅に戻す）"
      className="relative w-1 shrink-0 cursor-col-resize bg-slate-200 transition-colors hover:bg-blue-400 focus-visible:bg-blue-400 focus-visible:outline-none"
    >
      {/* 見た目は 4px のままで、掴める範囲だけ左右に広げる。 */}
      <span className="absolute inset-y-0 -left-1.5 -right-1.5" />
    </div>
  );
}
