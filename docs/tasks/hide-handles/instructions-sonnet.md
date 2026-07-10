# コーディング指示書（Sonnet 向け）— 接続ハンドルの表示制御

## あなたの役割
UMLwriter（Next.js + @xyflow/react のクラス図エディタ）のコーディング担当（Sonnet）。
本指示書の変更だけを、最小差分で実装する。指示外のリファクタリングや機能追加はしない。

作業前に `CLAUDE.md`（プロジェクト直下）と個人設定のルールに従うこと。特に:
- 日本語で応答・コメント・コミットメッセージを書く
- 変更は必要最小限。マジックナンバーは定数へ。型注釈を守る
- `console.log` / `any` を残さない

---

## 背景 / 解決したい問題
クラスの箱の上下左右には、関連線をつなぐための接続ハンドル（小さな白い丸）が
**常時表示**されている。このため次の 2 つが起きている。

1. 画像書き出し（SVG / PNG）したとき、丸が図に写り込んでしまう。
2. 編集していないときも常に丸が見えていて、図が煩雑に見える。

## 期待する挙動（受け入れ条件）
- 接続ハンドルの丸は **既定では見えない**。
- **マウスがそのクラスの箱に重なっている間** だけ、そのクラスのハンドルが見える。
- **クラスが選択されている間** も、そのクラスのハンドルが見える。
- ハンドルが見えている状態では、これまで通り **辺同士をドラッグして関連線を作れる**。
- **画像書き出し（SVG / PNG）には、選択中かどうかに関係なくハンドルが一切写らない。**

---

## 対象ファイルと具体的な変更

### 変更 1: `src/app/globals.css` — ハンドルの表示を hover / 選択時に限定する

React Flow のハンドルは DOM 上で `.react-flow__handle`、ノード本体は `.react-flow__node`
（選択中は `.react-flow__node.selected`）というクラスを持つ。これを CSS だけで制御する。

`globals.css` の末尾に、次の意図のルールを追加する（クラス名・セレクタは下記を厳守）。

```css
/* 接続ハンドル（4 辺の丸）は既定で隠し、
   マウスが箱に重なったとき・クラスが選択されたときだけ見せる。
   display:none ではなく opacity で消すのは、非表示中も接続ドラッグの
   当たり判定（pointer-events）を保つため。 */
.react-flow__handle {
  opacity: 0;
  transition: opacity 0.12s ease-in-out;
}

.react-flow__node:hover .react-flow__handle,
.react-flow__node.selected .react-flow__handle {
  opacity: 1;
}
```

補足:
- `visibility: hidden` や `display: none` は使わない。どちらもハンドルの pointer-events を
  落としてしまい、辺をつなぐドラッグができなくなる。`opacity: 0` なら見えないまま当たり判定は残る。
- `ClassNode.tsx` の `Handle` に付いている `!bg-white` などの Tailwind クラスは opacity を
  触っていないので、この CSS と競合しない。hover / selected セレクタの方が詳細度が高く優先される。

### 変更 2: `src/lib/exportImage.ts` — 書き出し画像からハンドルを除外する

CSS だけだと「選択中はハンドルを表示」というルールにより、**選択中のクラスがあると
その丸が書き出し画像に残ってしまう**。書き出しでは常にハンドルを消したいので、
除外フィルタにハンドルのクラスを加える。

`EXCLUDED_CLASSES` に `"react-flow__handle"` を追加する。

変更前:
```ts
const EXCLUDED_CLASSES = ["react-flow__panel", "react-flow__background"];
```
変更後:
```ts
const EXCLUDED_CLASSES = [
  "react-flow__panel",
  "react-flow__background",
  "react-flow__handle",
];
```
（既存コメント「chrome を除外する」の意図に沿う追加。コメントは必要なら軽く補う程度でよい。）

---

## やってはいけないこと
- `ClassNode.tsx` の `ConnectionHandles` を state（useState など）で出し分ける実装にしない。
  今回は CSS で完結させる方針。コンポーネントの構造は変えない。
- `Handle` の `type="source"` や 4 辺構成、`ConnectionMode.Loose` の設定を変えない。
- 既存の関連線の描画・保存・復元ロジックに手を入れない。

---

## セルフチェック（コミット前に必ず実施）
`npm run dev` で起動し、ブラウザで以下を確認する。

1. クラスを 2 つ以上置いた初期状態で、**どのクラスにもマウスを乗せていないとき**、
   4 辺の丸が見えないこと。
2. あるクラスに **マウスを乗せると**、そのクラスの 4 辺の丸が現れること。
   マウスを外すと消えること。
3. あるクラスを **クリックして選択している間**、そのクラスの丸が出たままになること。
4. ハンドルが見えている状態で、辺の丸から別クラスの辺へ **ドラッグして関連線を作れる** こと。
5. 図を **SVG と PNG で書き出し**、どちらの画像にも丸が写っていないこと。
   - **クラスを 1 つ選択したまま** 書き出しても、画像に丸が出ないこと（変更 2 の確認）。
6. `npm run build`（または `npx tsc --noEmit`）と `npm run lint` が通ること。

上記のうち失敗したものがあれば、失敗内容を添えて報告する（ごまかさない）。

## コミット
- conventional commits 形式・日本語で。例:
  `feat: 接続ハンドルを hover / 選択時のみ表示し画像書き出しから除外`
- 差分は小さいはず。push はプロジェクトの Git ルール（500 行未満なら自動 push 可）に従う。
