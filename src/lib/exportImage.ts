/**
 * クラス図の画像書き出し（SVG / PNG）。
 *
 * uml-class-diagram-tool/io/image-export.md に準拠し、html-to-image で
 * キャンバス DOM を画像化する。ミニマップ・コントロール・背景グリッドは除外し、
 * クラスの箱と関連線だけを白背景で残す。
 *
 * 注意: SVG マーカー定義（MarkerDefs）が含まれるよう、ReactFlow の viewport ではなく
 * マーカーとキャンバスを内包する外側コンテナ（.uml-canvas）を対象に渡すこと。
 * viewport だけだと url(#...) 参照が解決できず終端記号が消える。
 */

import { toPng, toSvg } from "html-to-image";

/** 書き出し形式。 */
export type ImageFormat = "svg" | "png";

/** 画像化から除外する React Flow の UI 要素（クラス名）。 */
const EXCLUDED_CLASSES = [
  "react-flow__panel",
  "react-flow__background",
  "react-flow__handle",
];

/** chrome（ミニマップ・コントロール・背景・透かし）を除外するフィルタ。 */
function excludeChrome(node: HTMLElement): boolean {
  if (node?.classList) {
    return !EXCLUDED_CLASSES.some((cls) => node.classList.contains(cls));
  }
  return true;
}

/** dataURL をファイルとしてダウンロードさせる。 */
function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

/**
 * コンテナ要素を画像化してダウンロードする。
 * SVG は拡大に強く UML 図向き、PNG は共有用ラスタ（2倍解像度）。
 */
export async function exportCanvasImage(
  container: HTMLElement,
  format: ImageFormat
): Promise<void> {
  const options = {
    filter: excludeChrome,
    backgroundColor: "#ffffff",
    ...(format === "png" ? { pixelRatio: 2 } : {}),
  };
  const dataUrl =
    format === "svg"
      ? await toSvg(container, options)
      : await toPng(container, options);
  downloadDataUrl(dataUrl, `class-diagram.${format}`);
}
