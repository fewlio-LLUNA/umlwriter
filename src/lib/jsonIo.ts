/**
 * Diagram の JSON 書き出し / 読み込み。
 *
 * io/json-persistence.md に準拠。サーバー送信は一切せず、ブラウザ内で完結する。
 * 書き出しは整形 JSON をダウンロード、読み込みはファイルを読んで zod で検証する。
 */

import type { Diagram } from "@/types/diagram";
import { parseDiagram } from "@/lib/diagramSchema";

/** ファイル名用に今日の日付を YYYYMMDD で返す。 */
function todayStamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/** Diagram を整形 JSON として `class-diagram-YYYYMMDD.json` でダウンロードさせる。 */
export function exportDiagramJson(diagram: Diagram): void {
  const blob = new Blob([JSON.stringify(diagram, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `class-diagram-${todayStamp()}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * ファイルを読み込み、検証済みの Diagram を返す。
 * JSON として壊れている / スキーマ不正 / 非対応バージョンのときは Error を投げる。
 */
export async function readDiagramFile(file: File): Promise<Diagram> {
  const text = await file.text();

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("JSON として読み取れませんでした。");
  }

  const result = parseDiagram(raw);
  if (!result.ok) {
    throw new Error(result.message);
  }
  return result.diagram;
}
