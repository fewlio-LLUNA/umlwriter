---
type: Data Schema
title: Diagram（ルート構造）
description: 図全体を表す最上位オブジェクト。JSON 入出力の単位。
tags: [schema, json, root]
timestamp: 2026-06-30T00:00:00Z
---

# Schema

図全体のルート。これを丸ごと JSON に落とし、読み込み時に検証する → [JSON Persistence](/io/json-persistence.md)。

```ts
interface Diagram {
  schemaVersion: string;      // 例 "1.0"。後方互換の判定に使う
  classes: ClassNode[];       // クラスの箱の配列
  edges: Edge[];              // 関連線の配列
  notes: NoteNode[];          // ノート（コメント）の配列。MVP では空配列でも可
}
```

# 構成要素

- `classes`: [ClassNode](/data-model/class-node.md) の配列
- `edges`: [Edge](/data-model/edge.md) の配列
- `notes`: [NoteNode](/uml-notation/notes-comments.md) の配列

# 設計メモ

- `schemaVersion` は将来のフォーマット変更に備えた目印。読み込み時に未知のメジャーは警告する。
- React Flow の `nodes` / `edges` とは別概念。描画用の構造とは双方向に変換する（永続データ ⇄ React Flow 表現）。
- ID はすべてアプリ内で一意（`crypto.randomUUID()` 等）。
