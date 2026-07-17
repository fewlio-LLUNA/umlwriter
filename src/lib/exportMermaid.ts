/**
 * Diagram の Mermaid Markdown 書き出し。
 *
 * 変換そのものは `src/lib/mermaid/` の純粋関数が担い、ここは
 * 「Markdown で包む」「ファイルとして保存させる」だけを受け持つ。
 * サーバー送信は一切せず、ブラウザ内で完結する（jsonIo.ts と同じ流儀）。
 */

import type { Diagram } from "@/types/diagram";
import { diagramToMermaid } from "@/lib/mermaid/document";

/** .md の見出し。図に名前を付ける機能が無いため固定。 */
const DOCUMENT_HEADING = "# クラス図";

/** ファイル名用に今日の日付を YYYYMMDD で返す。 */
function todayStamp(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Diagram を Mermaid ブロック入りの Markdown 文字列にする。
 * 貼り付け先を選ばないよう、見出しとコードフェンス以外は足さない。
 */
export function diagramToMarkdown(diagram: Diagram): string {
  return [
    DOCUMENT_HEADING,
    "",
    "```mermaid",
    diagramToMermaid(diagram),
    "```",
    "",
  ].join("\n");
}

/** Diagram を `class-diagram-YYYYMMDD.md` としてダウンロードさせる。 */
export function exportDiagramMarkdown(diagram: Diagram): void {
  const blob = new Blob([diagramToMarkdown(diagram)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `class-diagram-${todayStamp()}.md`;
  link.click();
  URL.revokeObjectURL(url);
}
