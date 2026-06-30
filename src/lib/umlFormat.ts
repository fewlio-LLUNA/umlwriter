/**
 * UML クラス図のメンバ（属性・操作）を 1 行のテキストに整形するヘルパ。
 *
 * 表示形式のルールは `uml-class-diagram-tool/data-model/` の各スキーマに準拠する。
 * 書体（static 下線・abstract 斜体）は描画側（ClassNode）の責務とし、
 * ここでは「文字列の組み立て」だけを担う。
 */

import type { Attribute, Operation, Parameter, Stereotype } from "@/types/diagram";

/**
 * 属性を `<可視性> <名前>: <型>` の形に整形する。
 * 型が未入力なら `: <型>` を省略する。
 *
 * 例: `- title: String`
 */
export function formatAttribute(attribute: Attribute): string {
  const typePart = attribute.type ? `: ${attribute.type}` : "";
  return `${attribute.visibility} ${attribute.name}${typePart}`;
}

/**
 * 操作を `<可視性> <名前>(<引数列>): <戻り型>` の形に整形する。
 * 引数は `name: type` をカンマ区切りで連結し、戻り型が未入力なら省略する。
 *
 * 例: `+ findById(id: String): Book`
 */
export function formatOperation(operation: Operation): string {
  const returnPart = operation.returnType ? `: ${operation.returnType}` : "";
  return `${operation.visibility} ${operation.name}(${formatParameters(
    operation.parameters
  )})${returnPart}`;
}

/** 引数 1 件を `name: type`（型が無ければ `name`）に整形する。 */
function formatParameter(parameter: Parameter): string {
  return parameter.type ? `${parameter.name}: ${parameter.type}` : parameter.name;
}

/** 引数リストを `name: type, name2: type2` 形式の 1 行に整形する（Inspector の引数欄用）。 */
export function formatParameters(parameters: Parameter[]): string {
  return parameters.map(formatParameter).join(", ");
}

/**
 * `name: type, name2: type2` 形式のテキストを引数配列に解析する（formatParameters の逆）。
 * 空のトークンは無視し、型が空なら省略する。記法エラーは握りつぶして緩く解釈する。
 */
export function parseParameters(text: string): Parameter[] {
  return text
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0)
    .map((token) => {
      const [name, ...rest] = token.split(":");
      const type = rest.join(":").trim();
      return type ? { name: name.trim(), type } : { name: name.trim() };
    });
}

/**
 * ステレオタイプの上部ラベル（ギュメ表記）を返す。
 * `none` はラベル無し（null）。`«` `»`（U+00AB / U+00BB）を使う。
 */
export function stereotypeLabel(stereotype: Stereotype): string | null {
  switch (stereotype) {
    case "abstract":
      return "«abstract»";
    case "interface":
      return "«interface»";
    case "enumeration":
      return "«enumeration»";
    case "none":
      return null;
  }
}
