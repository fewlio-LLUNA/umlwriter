---
type: UML Convention
title: メンバの描き分け（static 下線・abstract 斜体）
description: 属性・操作の特性を書体で表す UML 慣習。
tags: [uml, static, abstract, rendering]
timestamp: 2026-06-30T00:00:00Z
---

# ルール

| 特性 | 対象 | 表示 |
|------|------|------|
| static | 属性・操作 | テキストに下線 |
| abstract | 操作 | テキストを斜体 |

# データとの対応

- `Attribute.isStatic` → 下線 → [Attribute](/data-model/attribute.md)
- `Operation.isStatic` → 下線、`Operation.isAbstract` → 斜体 → [Operation](/data-model/operation.md)

# スコープ

MVP では器（フラグ）だけ用意し、表示切替の UI は次の波に回す → [Scope & Roadmap](/project/scope-roadmap.md)。
