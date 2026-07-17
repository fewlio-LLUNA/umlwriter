/**
 * Diagram 全体を Mermaid の classDiagram テキストへ組み立てる（L2）。
 *
 * ここは純粋関数。DOM・日付・乱数に依存しないので、単体テストで構文まで検証できる。
 */

import type { Diagram } from "@/types/diagram";
import { INDENT, type NameRegistry } from "@/lib/mermaid/types";
import {
  claimUniqueName,
  createNameRegistry,
  sanitizeMermaidName,
} from "@/lib/mermaid/identifiers";
import { buildClassBlock } from "@/lib/mermaid/classBlock";
import { buildRelationLine } from "@/lib/mermaid/relations";
import { groupClassesByPackage } from "@/lib/mermaid/namespaces";

/** 図の宣言行。 */
const DIAGRAM_HEADER = "classDiagram";

/**
 * クラスが 0 件のときに置く 1 行。
 * `classDiagram` だけだと Mermaid が構文エラーにするため、有効な図にする詰め物が要る
 * （設計書 §4-4-2 で実測）。
 */
const EMPTY_DIAGRAM_NOTE = 'note "クラスがありません"';

/** Diagram を Mermaid の classDiagram テキストへ変換する（前後の改行なし）。 */
export function diagramToMermaid(diagram: Diagram): string {
  const registry = createNameRegistry(diagram.classes);
  const body =
    diagram.classes.length === 0
      ? [EMPTY_DIAGRAM_NOTE]
      : [...buildClassSection(diagram, registry), ...buildRelationSection(diagram, registry)];

  return [DIAGRAM_HEADER, ...body.map((line) => `${INDENT}${line}`)].join("\n");
}

/** namespace 付きのクラス定義部分を組み立てる。 */
function buildClassSection(diagram: Diagram, registry: NameRegistry): string[] {
  const { grouped, ungrouped } = groupClassesByPackage(
    diagram.classes,
    diagram.packages
  );
  const namespaceNames = createNamespaceNames(grouped.map(({ pkg }) => pkg.name));

  const namespaceLines = grouped.flatMap(({ classes }, index) => [
    `namespace ${namespaceNames[index]} {`,
    ...classes
      .flatMap((cls) => buildClassBlock(cls, registry))
      .map((line) => `${INDENT}${line}`),
    "}",
  ]);

  return [
    ...namespaceLines,
    ...ungrouped.flatMap((cls) => buildClassBlock(cls, registry)),
  ];
}

/** 関連線の部分を組み立てる。解決できないエッジは黙って読み飛ばす。 */
function buildRelationSection(diagram: Diagram, registry: NameRegistry): string[] {
  return diagram.edges
    .map((edge) => buildRelationLine(edge, registry))
    .filter((line): line is string => line !== null);
}

/**
 * パッケージ名を namespace 名へ。クラス名と同じ規則でサニタイズし、
 * 重複したら連番を付ける（同名の namespace が 2 つあると図が壊れるため）。
 */
function createNamespaceNames(packageNames: string[]): string[] {
  const used = new Set<string>();
  return packageNames.map((name) =>
    claimUniqueName(sanitizeMermaidName(name), used)
  );
}
