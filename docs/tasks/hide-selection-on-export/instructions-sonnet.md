# コーディング指示書（Sonnet 向け）— 書き出し画像から選択青枠を消す

## あなたの役割
UMLwriter（Next.js + @xyflow/react）のコーディング担当（Sonnet）。
本指示書の変更だけを最小差分で実装する。指示外のリファクタリング・機能追加はしない。
`CLAUDE.md` と個人設定に従う（日本語コメント／`console.log`・`any` 禁止／型注釈厳守）。

前提: 直前タスク「接続ハンドルを hover / 選択時のみ表示し画像書き出しから除外」
（commit `af0f689`）は適用済み。本タスクはその続き。

---

## 背景 / 解決したい問題
クラスを**選択した状態**で画像書き出し（SVG / PNG）すると、選択を示す
**青い枠・青いリング**（`border-blue-500 ring-2 ring-blue-300`）が画像に残ってしまう。
接続ハンドルの丸は前タスクで消えたが、青枠はまだ残る。

青枠は接続ハンドルと違い「別の DOM 要素」ではなく、`ClassNode` の内側 div に
`selected` prop 由来で付く Tailwind クラスなので、書き出しの除外フィルタでは消せない。

## 期待する挙動（受け入れ条件）
- 画面上では今まで通り、選択中のクラスに青枠・青リングが表示される（**挙動を変えない**）。
- **画像書き出し（SVG / PNG）したとき、クラスを選択したままでも青枠・青リングが画像に写らない。**
- 書き出し後、画面の選択状態・見た目は元のまま（選択が外れたりしない）。
- 非選択クラスの通常の枠（slate-700）と `shadow-sm` は書き出し画像でも従来通り。

## 実装アプローチ（方針）
「書き出しの瞬間だけ、コンテナ `.uml-canvas` に一時クラス `.exporting` を付け、
CSS で選択青枠を打ち消す」。React の選択状態（`selected`）は一切触らない。
`getComputedStyle` は同期的にクラスを反映するため、撮影直前にクラスを付ければ
html-to-image のクローンにも反映される。

---

## 対象ファイルと具体的な変更（3 箇所）

### 変更 1: `src/components/nodes/ClassNode.tsx` — 箱に安定したクラス名を付ける
CSS から確実に狙えるよう、クラスの箱（root の div）に `uml-class-box` を追加する。
DOM 構造依存（`> div` 等）を避けるための目印。既存クラスは消さない。

変更前:
```tsx
    <div
      className={`min-w-[180px] rounded-sm border bg-white text-slate-900 shadow-sm ${
        selected ? "border-blue-500 ring-2 ring-blue-300" : "border-slate-700"
      }`}
    >
```
変更後（先頭に `uml-class-box ` を足すだけ）:
```tsx
    <div
      className={`uml-class-box min-w-[180px] rounded-sm border bg-white text-slate-900 shadow-sm ${
        selected ? "border-blue-500 ring-2 ring-blue-300" : "border-slate-700"
      }`}
    >
```

### 変更 2: `src/app/globals.css` — 書き出し中だけ青枠を打ち消す
前タスクで追加したハンドルの CSS の下に、次を追加する。

```css
/* 画像書き出し中（.uml-canvas.exporting）は、選択クラスの青枠・青リングを消して
   非選択と同じ見た目で画像化する。枠色は slate-700 に戻し、リングは Tailwind の
   リング変数を無効化する（shadow-sm はそのまま残る）。 */
.uml-canvas.exporting .react-flow__node.selected .uml-class-box {
  border-color: var(--color-slate-700, #334155);
  --tw-ring-shadow: 0 0 #0000;
}
```
補足:
- `var(--color-slate-700, #334155)`: Tailwind v4 のカラートークンを使い、
  非選択時の `border-slate-700` と同じ色に戻す。`#334155` は slate-700 のフォールバック。
- `--tw-ring-shadow: 0 0 #0000`: Tailwind がリング未使用時に入れる既定値。
  これでリング（青いにじみ）だけ消え、`shadow-sm` は box-shadow に残る。
- `display:none` 等は使わない（箱ごと消えてしまう）。

### 変更 3: `src/lib/exportImage.ts` — 撮影の前後で `.exporting` を付け外しする
`exportCanvasImage` の撮影処理を try/finally で包み、コンテナに `.exporting` を
付けてから撮影、必ず外す。

変更前:
```ts
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
```
変更後:
```ts
export async function exportCanvasImage(
  container: HTMLElement,
  format: ImageFormat
): Promise<void> {
  const options = {
    filter: excludeChrome,
    backgroundColor: "#ffffff",
    ...(format === "png" ? { pixelRatio: 2 } : {}),
  };
  // 撮影中だけ .exporting を付け、選択クラスの青枠を CSS で打ち消す。
  // 例外が出ても必ず外せるよう finally で戻す。
  container.classList.add("exporting");
  try {
    const dataUrl =
      format === "svg"
        ? await toSvg(container, options)
        : await toPng(container, options);
    downloadDataUrl(dataUrl, `class-diagram.${format}`);
  } finally {
    container.classList.remove("exporting");
  }
}
```

---

## やってはいけないこと
- `selected` prop の扱いや、画面上の選択見た目（青枠）のロジックを変えない。
  変えるのは「書き出し画像だけ」。
- `setNodes` 等で選択状態を解除する方式にしない（Inspector がチラつく）。
- 書き出しの除外フィルタ（`EXCLUDED_CLASSES`）はハンドルのままで、青枠用に触らない。
- ハンドル関連（前タスク）の CSS を消さない。

---

## セルフチェック（コミット前に必ず実施）
`npm run dev` で起動して確認する。

1. クラスを選択すると、画面上は今まで通り青枠・青リングが出る（回帰なし）。
2. **クラスを選択したまま** SVG で書き出す → 画像に青枠・青リングが写らない。
3. 同じく **選択したまま** PNG で書き出す → 画像に青枠・青リングが写らない。
4. 非選択クラスの通常の枠（濃いグレー）と薄い影は、書き出し画像でも従来通り残る。
5. 書き出し後、画面のクラスは選択されたまま（選択が外れない）・見た目も元通り。
6. 前タスクの確認: 書き出し画像に接続ハンドルの丸が写らない（回帰なし）。
7. `npx tsc --noEmit` と `npm run lint` が通る。

失敗があれば内容を添えて報告する（ごまかさない）。

## コミット
- conventional commits・日本語。例:
  `fix: 選択中クラスの青枠を画像書き出しから除外`
