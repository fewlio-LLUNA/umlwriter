/**
 * 属性・操作を Mermaid のメンバ 1 行へ整形する（A2）。
 *
 * 画面表示用の `src/lib/umlFormat.ts` とは別物なので流用しない。
 * 違いは戻り型の区切り（画面は `: `、Mermaid は `)` の後ろに半角スペース）と、
 * static / abstract を分類子（`$` / `*`）で表す点。
 */

import type { Attribute, Operation, Parameter } from "@/types/diagram";

/** static メンバに付ける分類子。 */
const STATIC_CLASSIFIER = "$";

/** abstract な操作に付ける分類子。 */
const ABSTRACT_CLASSIFIER = "*";

/**
 * 型を Mermaid のジェネリクス記法へ寄せる。`List<String>` → `List~String~`。
 *
 * カンマを含むジェネリクス（`Map<K, V>`）は Mermaid が非対応なので変換せず素通しする。
 * 素通ししても Mermaid 側が `<` `>` をエスケープして文字どおり表示するため壊れはしない。
 */
export function formatMermaidType(type: string): string {
  if (!type.includes("<") || type.includes(",")) {
    return type;
  }
  return type.replaceAll("<", "~").replaceAll(">", "~");
}

/**
 * 属性を `<可視性><名前>: <型><分類子>` に整形する。
 * 型が未入力なら `: <型>` を省略する。
 *
 * 例: `-title: String` / static なら `-count: int$`
 */
export function formatAttributeMember(attribute: Attribute): string {
  const typePart = attribute.type ? `: ${formatMermaidType(attribute.type)}` : "";
  const classifier = attribute.isStatic ? STATIC_CLASSIFIER : "";
  return `${attribute.visibility}${attribute.name}${typePart}${classifier}`;
}

/**
 * 操作を `<可視性><名前>(<引数>)<分類子> <戻り型>` に整形する。
 *
 * 分類子は括弧の直後に置く。Mermaid は「戻り型の末尾 1 文字が `$*` なら分類子」という
 * フォールバックも持つが、括弧直後なら正規表現が直接拾うので確実（設計書 §4-4-2）。
 * static と abstract が両立したときは static を優先する（Mermaid の分類子は 1 つだけ）。
 *
 * 例: `+findById(id: String)$ Book`
 */
export function formatOperationMember(operation: Operation): string {
  const params = operation.parameters.map(formatParameterMember).join(", ");
  const returnPart = operation.returnType
    ? ` ${formatMermaidType(operation.returnType)}`
    : "";
  return `${operation.visibility}${operation.name}(${params})${operationClassifier(
    operation
  )}${returnPart}`;
}

/** 操作に付ける分類子を決める。static 優先、次に abstract、どちらでもなければ空。 */
function operationClassifier(operation: Operation): string {
  if (operation.isStatic) return STATIC_CLASSIFIER;
  if (operation.isAbstract) return ABSTRACT_CLASSIFIER;
  return "";
}

/** 引数 1 件を `name: type`（型が無ければ `name`）に整形する。 */
function formatParameterMember(parameter: Parameter): string {
  return parameter.type
    ? `${parameter.name}: ${formatMermaidType(parameter.type)}`
    : parameter.name;
}
