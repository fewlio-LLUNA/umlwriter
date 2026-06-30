---
type: UML Convention
title: ステレオタイプ（abstract / interface / enumeration）
description: クラスの種別表示と書体ルール。
tags: [uml, stereotype, abstract, interface]
timestamp: 2026-06-30T00:00:00Z
---

# 種別と表示

| stereotype | 上部ラベル | クラス名の書体 | 備考 |
|------------|-----------|----------------|------|
| `none`        | なし | 通常 | 普通のクラス |
| `abstract`    | （任意で `«abstract»`） | 斜体 | 抽象クラスはクラス名を斜体に |
| `interface`   | `«interface»` | 通常または斜体 | ギュメ `«»` を名前の上に |
| `enumeration` | `«enumeration»` | 通常 | 属性欄を列挙値として扱う（MVP 後） |

# ギュメ記号

`«` `»`（U+00AB / U+00BB）を使う。`<<` `>>` の代用は避ける。

# 関連での扱い

`interface` を `target` にする実現関係は破線+白三角 → [Relationships](/uml-notation/relationships.md)。

# 親

[ClassNode](/data-model/class-node.md) の `stereotype` フィールドで表現。
