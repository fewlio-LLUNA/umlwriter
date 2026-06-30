---
type: UML Convention
title: ノート（コメント）
description: 折れ角付きの注記ボックス。任意のクラス・関連に紐付けられる。
tags: [uml, note, comment]
timestamp: 2026-06-30T00:00:00Z
---

# Schema

```ts
interface NoteNode {
  id: string;
  text: string;
  position: { x: number; y: number };
  attachedTo?: string[];   // 紐付け先 ClassNode.id / Edge.id（破線で結ぶ）
}
```

# 描画

右上が折れた長方形（UML のノート記号）で描く。`attachedTo` があれば対象へ破線を引く。

# スコープ

MVP 後の追加要素 → [Scope & Roadmap](/project/scope-roadmap.md)。
[Diagram](/data-model/diagram.md) の `notes` に格納。MVP では空配列のまま。
