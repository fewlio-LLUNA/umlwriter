---
type: IO Spec
title: JSON 永続化（書き出し / 読み込み / 自動保存）
description: 図データをブラウザ内で JSON として保存・復元する。
tags: [io, json, localstorage]
timestamp: 2026-06-30T00:00:00Z
---

# 書き出し（ダウンロード）

[Diagram](/data-model/diagram.md) オブジェクトを `JSON.stringify` し、`Blob` + `URL.createObjectURL` で
`.json` ファイルとしてダウンロードさせる。ファイル名例: `class-diagram-YYYYMMDD.json`。

```ts
function exportJson(diagram: Diagram) {
  const blob = new Blob([JSON.stringify(diagram, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "class-diagram.json"; a.click();
  URL.revokeObjectURL(url);
}
```

# 読み込み（アップロード）

`<input type="file" accept="application/json">` で受け取り、`JSON.parse` 後に **zod 等で検証**する。
`schemaVersion` を見て未知メジャーなら警告。検証 NG なら読み込みを中断しユーザーに通知。

# 自動保存

`localStorage` に図全体を保存し、起動時に復元する（リロード対策）。
※ これは Vercel 上の実アプリでの話。ブラウザ標準 API なので問題なく使える。

```ts
// 保存（debounce 推奨）
localStorage.setItem("uml-diagram", JSON.stringify(diagram));
// 復元
const saved = localStorage.getItem("uml-diagram");
```

# 方針

サーバー送信は一切しない。クラウド保存が欲しくなったら Supabase を後付けする
→ [Scope & Roadmap](/project/scope-roadmap.md)。
