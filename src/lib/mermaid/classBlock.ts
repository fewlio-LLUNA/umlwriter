/**
 * クラス 1 個を Mermaid の class ブロックへ組み立てる（A3）。
 */

import type { ClassNode, Stereotype } from "@/types/diagram";
import { INDENT, type NameRegistry } from "@/lib/mermaid/types";
import {
  formatAttributeMember,
  formatOperationMember,
} from "@/lib/mermaid/members";

/** ステレオタイプ → Mermaid のアノテーション表記。`none` は付けない。 */
const STEREOTYPE_ANNOTATIONS: Record<Stereotype, string | null> = {
  none: null,
  abstract: "<<abstract>>",
  interface: "<<interface>>",
  enumeration: "<<enumeration>>",
};

/**
 * class ブロックを行の配列で返す（インデント無しの状態）。
 * namespace 内への字下げは呼び出し側（document.ts）の責務。
 *
 * 中身（ステレオタイプ・属性・操作）が 1 つも無いときは `class Book` の 1 行だけを返す。
 */
export function buildClassBlock(
  cls: ClassNode,
  registry: NameRegistry
): string[] {
  const id = registry.idOf(cls.id);
  if (id === null) return [];

  const header = `class ${id}${classLabel(cls.name, id)}`;
  const body = buildClassBody(cls);
  if (body.length === 0) return [header];

  return [`${header} {`, ...body.map((line) => `${INDENT}${line}`), "}"];
}

/** ステレオタイプ・属性・操作を並べた中身の行を返す。 */
function buildClassBody(cls: ClassNode): string[] {
  const annotation = STEREOTYPE_ANNOTATIONS[cls.stereotype];
  return [
    ...(annotation ? [annotation] : []),
    ...cls.attributes.map(formatAttributeMember),
    ...cls.operations.map(formatOperationMember),
  ];
}

/**
 * 表示ラベル `["元の名前"]` を返す。識別子が元の名前と同じなら空文字。
 *
 * 識別子と比較するのは、サニタイズによる置換だけでなく **同名クラスの連番回避**
 * （`Book` と `Book_2`）でも元の名前が失われるため。
 *
 * ラベル構文は比較的新しく、貼り付け先の Mermaid が古いと壊れ得る。
 * そのため「使わないと元の名前が失われる」場合に限って使い、互換リスクを最小化する
 * （設計書 §4-4-2）。
 */
function classLabel(originalName: string, mermaidId: string): string {
  // 空ラベル `[""]` は Mermaid の構文エラーになる。そもそも保つべき名前も無い。
  if (originalName.length === 0) return "";
  if (mermaidId === originalName) return "";
  // ラベルは二重引用符で囲むため、名前に含まれる `"` は `'` に逃がす。
  return `["${originalName.replaceAll('"', "'")}"]`;
}
