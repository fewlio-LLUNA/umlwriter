---
type: Data Schema
title: Attribute（属性）
description: クラスのフィールド 1 件。可視性・名前・型・説明を持つ。
tags: [schema, attribute]
timestamp: 2026-06-30T00:00:00Z
---

# Schema

```ts
interface Attribute {
  id: string;
  visibility: Visibility;     // "+" | "-" | "#" | "~"
  name: string;               // 属性名
  type?: string;              // 型（任意。"String" 等の自由入力）
  isStatic?: boolean;         // static なら下線表示
  description?: string;       // 任意の説明
}
```

# 表示形式

`<可視性> <名前>: <型>` の形で 1 行描画する。例: `- title: String`
- 可視性の記号 → [Visibility](/uml-notation/visibility.md)
- `isStatic` が true のとき下線 → [Member Rendering](/uml-notation/member-rendering.md)
- `type` 未入力なら `: <型>` を省略

# 親

[ClassNode](/data-model/class-node.md) の `attributes` に格納される。
