"use client";

import { MARKER_IDS } from "./markerConfig";

/** マーカーの線・塗り色。 */
const STROKE = "#334155"; // slate-700
const FILL_WHITE = "#ffffff";

/**
 * カスタムエッジが参照する SVG マーカー定義。
 *
 * 画面に 1 度だけ描画する不可視 SVG。各エッジは `url(#id)` でこれらを参照する。
 * 白三角 / 開矢印 / 白ダイヤ / 塗りダイヤ の 4 種で 6 種の関連を表現する。
 * source 側に付くダイヤは markerStart 用に `orient="auto-start-reverse"` で向きを合わせる。
 */
export function MarkerDefs() {
  return (
    <svg
      aria-hidden
      style={{ position: "absolute", width: 0, height: 0 }}
    >
      <defs>
        {/* 白三角（汎化・実現）: tip を target 側に向ける */}
        <marker
          id={MARKER_IDS.triangle}
          viewBox="0 0 12 12"
          markerWidth={14}
          markerHeight={14}
          refX={11}
          refY={6}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M1,1 L11,6 L1,11 z" fill={FILL_WHITE} stroke={STROKE} />
        </marker>

        {/* 開矢印（依存） */}
        <marker
          id={MARKER_IDS.openArrow}
          viewBox="0 0 12 12"
          markerWidth={14}
          markerHeight={14}
          refX={10}
          refY={6}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M1,1 L11,6 L1,11" fill="none" stroke={STROKE} />
        </marker>

        {/* 白ダイヤ（集約）: source 側に付く。orient=auto で線端から target 方向へ伸ばす。 */}
        <marker
          id={MARKER_IDS.diamondWhite}
          viewBox="0 0 20 12"
          markerWidth={22}
          markerHeight={14}
          refX={1}
          refY={6}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path
            d="M1,6 L10,1 L19,6 L10,11 z"
            fill={FILL_WHITE}
            stroke={STROKE}
          />
        </marker>

        {/* 塗りダイヤ（コンポジション）: source 側に付く。orient=auto で線端から target 方向へ伸ばす。 */}
        <marker
          id={MARKER_IDS.diamondFilled}
          viewBox="0 0 20 12"
          markerWidth={22}
          markerHeight={14}
          refX={1}
          refY={6}
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M1,6 L10,1 L19,6 L10,11 z" fill={STROKE} stroke={STROKE} />
        </marker>
      </defs>
    </svg>
  );
}
