/**
 * 関連線 1 本を Mermaid の 1 行へ変換する（B1）。
 *
 * 最大の注意点は **向き**。本アプリは `source → target` で意味を固定しているが
 * （target が親 / target が interface）、Mermaid は終端記号が **左側** のクラスに付く。
 * そのため汎化・実現は左右を入れ替えて書く必要がある。多重度も一緒に入れ替わる。
 */

import type { Edge, RelationKind } from "@/types/diagram";
import type { NameRegistry } from "@/lib/mermaid/types";

/** 関連の種類ごとの Mermaid 表現。 */
interface RelationStyle {
  /** 矢印記号。 */
  arrow: string;
  /**
   * 左右を入れ替えるか。
   * Mermaid は記号が左側に付くため、`target` 側に記号が要る種類（汎化・実現）で true。
   */
  swap: boolean;
}

const RELATION_STYLES: Record<RelationKind, RelationStyle> = {
  association: { arrow: "-->", swap: false },
  aggregation: { arrow: "o--", swap: false },
  composition: { arrow: "*--", swap: false },
  generalization: { arrow: "<|--", swap: true },
  realization: { arrow: "<|..", swap: true },
  dependency: { arrow: "..>", swap: false },
};

/**
 * 関連 1 本を 1 行に整形する。
 * source / target が registry で解決できなければ null（＝出力しない）。
 *
 * 例: `Library "1" o-- "*" Book : 蔵書`
 */
export function buildRelationLine(
  edge: Edge,
  registry: NameRegistry
): string | null {
  const sourceId = registry.idOf(edge.source);
  const targetId = registry.idOf(edge.target);
  if (sourceId === null || targetId === null) return null;

  const style = RELATION_STYLES[edge.kind];
  // 入れ替えるときは多重度も一緒に入れ替える（片方だけ直すと端が逆になる）。
  const [left, leftMultiplicity, right, rightMultiplicity] = style.swap
    ? [targetId, edge.targetMultiplicity, sourceId, edge.sourceMultiplicity]
    : [sourceId, edge.sourceMultiplicity, targetId, edge.targetMultiplicity];

  const parts = [
    left,
    multiplicityPart(leftMultiplicity),
    style.arrow,
    multiplicityPart(rightMultiplicity),
    right,
  ].filter((part) => part.length > 0);

  return `${parts.join(" ")}${labelPart(edge.label)}`;
}

/** 多重度を `"1"` の形に。未入力なら空文字（＝行から省く）。 */
function multiplicityPart(multiplicity: string | undefined): string {
  const trimmed = multiplicity?.trim() ?? "";
  return trimmed.length > 0 ? `"${trimmed}"` : "";
}

/** 関連名を ` : ラベル` の形に。未入力なら空文字。 */
function labelPart(label: string | undefined): string {
  const trimmed = label?.trim() ?? "";
  return trimmed.length > 0 ? ` : ${trimmed}` : "";
}
