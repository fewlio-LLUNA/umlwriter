/**
 * 関連の種類（RelationKind）→ 線種・終端記号の対応表。
 *
 * 記法は uml-class-diagram-tool/uml-notation/relationships.md に準拠する。
 * `source` → `target` の向きを前提に、どちらの端にどのマーカーを付けるかを定める。
 * マーカー ID は MarkerDefs で定義した SVG marker の id に対応する。
 */

import type { RelationKind } from "@/types/diagram";

/** MarkerDefs で定義する SVG marker の id。 */
export const MARKER_IDS = {
  triangle: "uml-triangle", // 白三角（汎化・実現）
  openArrow: "uml-open-arrow", // 開矢印（依存）
  diamondWhite: "uml-diamond-white", // 白ダイヤ（集約）
  diamondFilled: "uml-diamond-filled", // 塗りダイヤ（コンポジション）
} as const;

/** エッジ 1 本の描画スタイル。markerStart は source 側、markerEnd は target 側。 */
export interface EdgeStyle {
  dashed: boolean;
  /** source 側の終端記号（`url(#...)`）。無ければ undefined。 */
  markerStart?: string;
  /** target 側の終端記号（`url(#...)`）。無ければ undefined。 */
  markerEnd?: string;
}

/** `url(#id)` 形式に整形する。 */
const ref = (id: string): string => `url(#${id})`;

/** kind に対応する線種・終端記号を返す。 */
export function edgeStyleOf(kind: RelationKind): EdgeStyle {
  switch (kind) {
    case "association":
      // 実線・記号なし（開矢印は任意のため MVP では省略）。
      return { dashed: false };
    case "aggregation":
      // 実線・白ダイヤを全体（source）側に。
      return { dashed: false, markerStart: ref(MARKER_IDS.diamondWhite) };
    case "composition":
      // 実線・塗りダイヤを全体（source）側に。
      return { dashed: false, markerStart: ref(MARKER_IDS.diamondFilled) };
    case "generalization":
      // 実線・白三角を親（target）側に。
      return { dashed: false, markerEnd: ref(MARKER_IDS.triangle) };
    case "realization":
      // 破線・白三角を interface（target）側に。
      return { dashed: true, markerEnd: ref(MARKER_IDS.triangle) };
    case "dependency":
      // 破線・開矢印を target 側に。
      return { dashed: true, markerEnd: ref(MARKER_IDS.openArrow) };
  }
}
