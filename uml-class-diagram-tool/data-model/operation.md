---
type: Data Schema
title: Operation（操作）
description: クラスのメソッド 1 件。引数リストと戻り型を持つ。
tags: [schema, operation, method]
timestamp: 2026-06-30T00:00:00Z
---

# Schema

```ts
interface Operation {
  id: string;
  visibility: Visibility;     // "+" | "-" | "#" | "~"
  name: string;               // 操作名
  parameters: Parameter[];    // 引数（順序保持）
  returnType?: string;        // 戻り型（任意）
  isStatic?: boolean;         // static なら下線
  isAbstract?: boolean;       // abstract なら斜体
  description?: string;       // 任意の説明
}

interface Parameter {
  name: string;
  type?: string;
}
```

# 表示形式

`<可視性> <名前>(<引数列>): <戻り型>` の形で描画する。
例: `+ findById(id: String): Book`
- 引数列は `name: type` をカンマ区切りで連結
- 可視性 → [Visibility](/uml-notation/visibility.md)
- `isStatic` 下線・`isAbstract` 斜体 → [Member Rendering](/uml-notation/member-rendering.md)

# 親

[ClassNode](/data-model/class-node.md) の `operations` に格納される。
