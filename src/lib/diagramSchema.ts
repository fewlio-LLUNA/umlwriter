/**
 * Diagram の zod スキーマと検証。
 *
 * JSON 読み込み（外部ファイル＝信頼できない入力）の検証に使う。
 * スキーマは src/types/diagram.ts の型に対応させ、schemaVersion のメジャーが
 * 非対応なら読み込みを中断する。
 */

import { z } from "zod";

import type { Diagram } from "@/types/diagram";
import { SCHEMA_VERSION } from "@/lib/storage";

const visibilitySchema = z.enum(["+", "-", "#", "~"]);
const stereotypeSchema = z.enum([
  "none",
  "abstract",
  "interface",
  "enumeration",
]);
const relationKindSchema = z.enum([
  "association",
  "aggregation",
  "composition",
  "generalization",
  "realization",
  "dependency",
]);

const positionSchema = z.object({ x: z.number(), y: z.number() });

const parameterSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
});

const attributeSchema = z.object({
  id: z.string(),
  visibility: visibilitySchema,
  name: z.string(),
  type: z.string().optional(),
  isStatic: z.boolean().optional(),
  description: z.string().optional(),
});

const operationSchema = z.object({
  id: z.string(),
  visibility: visibilitySchema,
  name: z.string(),
  parameters: z.array(parameterSchema),
  returnType: z.string().optional(),
  isStatic: z.boolean().optional(),
  isAbstract: z.boolean().optional(),
  description: z.string().optional(),
});

const classNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  stereotype: stereotypeSchema,
  description: z.string().optional(),
  attributes: z.array(attributeSchema),
  operations: z.array(operationSchema),
  position: positionSchema,
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  kind: relationKindSchema,
  label: z.string().optional(),
  sourceMultiplicity: z.string().optional(),
  targetMultiplicity: z.string().optional(),
  sourceRole: z.string().optional(),
  targetRole: z.string().optional(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
});

const packageNodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  position: positionSchema,
  width: z.number(),
  height: z.number(),
});

const noteNodeSchema = z.object({
  id: z.string(),
  text: z.string(),
  position: positionSchema,
  attachedTo: z.array(z.string()).optional(),
});

/** 図全体のスキーマ。edges / packages / notes は欠けていても空配列で受ける。 */
const diagramSchema = z.object({
  schemaVersion: z.string(),
  classes: z.array(classNodeSchema),
  edges: z.array(edgeSchema).default([]),
  packages: z.array(packageNodeSchema).default([]),
  notes: z.array(noteNodeSchema).default([]),
});

/** schemaVersion 文字列からメジャー番号（"1.0" → "1"）を取り出す。 */
function majorOf(version: string): string {
  return version.split(".")[0];
}

/** 検証結果（成功なら diagram、失敗なら理由）。 */
export type ParseResult =
  | { ok: true; diagram: Diagram }
  | { ok: false; message: string };

/**
 * 任意の値を Diagram として検証する。
 * 構造が不正、または schemaVersion のメジャーが非対応なら失敗を返す。
 */
export function parseDiagram(raw: unknown): ParseResult {
  const result = diagramSchema.safeParse(raw);
  if (!result.success) {
    return { ok: false, message: "クラス図の形式として正しくありません。" };
  }
  if (majorOf(result.data.schemaVersion) !== majorOf(SCHEMA_VERSION)) {
    return {
      ok: false,
      message: `非対応のバージョンです（schemaVersion: ${result.data.schemaVersion}）。`,
    };
  }
  return { ok: true, diagram: result.data };
}
