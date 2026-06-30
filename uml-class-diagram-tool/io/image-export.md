---
type: IO Spec
title: 画像書き出し（SVG / PNG）
description: 完成したクラス図を画像として保存する。
tags: [io, image, svg, png, html-to-image]
timestamp: 2026-06-30T00:00:00Z
---

# 方式

`html-to-image` で React Flow のビューポート DOM を画像化する。
- **SVG**: `toSvg()`。拡大しても潰れないため UML 図に向く（推奨）
- **PNG**: `toPng()`。共有用のラスタ

```ts
import { toSvg, toPng } from "html-to-image";

async function exportImage(viewportEl: HTMLElement, fmt: "svg" | "png") {
  const dataUrl = fmt === "svg" ? await toSvg(viewportEl) : await toPng(viewportEl);
  const a = document.createElement("a");
  a.href = dataUrl; a.download = `class-diagram.${fmt}`; a.click();
}
```

# 書き出し前の整え

- 図全体が収まるよう一旦 `fitView` してから対象範囲を決める
- ミニマップ・コントロール・背景グリッドは書き出しから除外（クラス図だけ残す）
- 余白（padding）を少し付けて端が切れないようにする

# 対象

キャンバス → [Canvas](/ui/canvas.md)。操作は [Toolbar](/ui/toolbar.md) のボタンから。
