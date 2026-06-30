---
type: Data Schema
title: ClassNode（クラスの箱）
description: 1 つのクラス・インターフェース・列挙を表すノード。
tags: [schema, class]
timestamp: 2026-06-30T00:00:00Z
---

# Schema

```ts
interface ClassNode {
  id: string;                 // 一意 ID
  name: string;               // クラス名
  stereotype: Stereotype;     // "none" | "abstract" | "interface" | "enumeration"
  description?: string;       // 任意の説明（例: "本クラス"）
  attributes: Attribute[];    // 属性の配列（順序保持）
  operations: Operation[];    // 操作の配列（順序保持）
  position: { x: number; y: number };  // キャンバス上の座標
}

type Stereotype = "none" | "abstract" | "interface" | "enumeration";
```

# 構成要素

- `attributes`: [Attribute](/data-model/attribute.md) の配列
- `operations`: [Operation](/data-model/operation.md) の配列
- `stereotype` の表示ルール → [Stereotypes](/uml-notation/stereotypes.md)

# 描画

UML の 3 段組（クラス名 / 属性 / 操作）で箱を描く。
ステレオタイプは名前の上に `«interface»` のように出す → [Stereotypes](/uml-notation/stereotypes.md)。
`position` の変更で関連線が自動追従する → [Canvas](/ui/canvas.md)。

# 備考

- `enumeration` の場合、属性欄を列挙値リストとして使う運用（MVP 後）。
- 説明文 `description` はホバー表示か箱下の小さな注記で見せる → [Inspector](/ui/inspector.md)。
