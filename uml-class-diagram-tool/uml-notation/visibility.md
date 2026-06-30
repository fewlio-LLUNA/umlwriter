---
type: UML Convention
title: 可視性（Visibility）
description: 属性・操作に付く 4 種の可視性記号。
tags: [uml, visibility]
timestamp: 2026-06-30T00:00:00Z
---

# Schema

```ts
type Visibility = "+" | "-" | "#" | "~";
```

# 記号と意味（4 択）

| 記号 | 名称 | 意味 |
|------|------|------|
| `+`  | public | どこからでもアクセス可 |
| `-`  | private | 自クラス内のみ |
| `#`  | protected | 自クラスとサブクラス |
| `~`  | package | 同一パッケージ内 |

# UI

[Inspector](/ui/inspector.md) ではセレクト（4 択）で選ばせ、行頭に記号を描画する。
[Attribute](/data-model/attribute.md) と [Operation](/data-model/operation.md) の両方が持つ。
