---
type: UI Spec
title: キャンバス（作図領域）
description: React Flow による作図面。クラスの箱と関連線を描く。
tags: [ui, canvas, react-flow]
timestamp: 2026-06-30T00:00:00Z
---

# クラスの箱（カスタムノード）

UML 標準の 3 段組で描く:

```
┌────────────────────┐
│   «interface»      │  ← ステレオタイプ（任意）
│     ClassName       │  ← クラス名（abstract/interface は斜体）
├────────────────────┤
│ - title: String     │  ← 属性
│ + price: Number     │
├────────────────────┤
│ + findById(id): Book│  ← 操作
└────────────────────┘
```

- 書体ルール → [Member Rendering](/uml-notation/member-rendering.md) / [Stereotypes](/uml-notation/stereotypes.md)
- 説明文はホバー表示か箱下の小さな注記

# 関連線（カスタムエッジ）

`kind` ごとに線種・終端記号を切替 → [Relationships](/uml-notation/relationships.md)。
ノード移動で接続点が自動再計算され、線が追従する（React Flow 標準）。

# 操作

- ドラッグでクラス移動（`position` 更新 → [ClassNode](/data-model/class-node.md)）
- ホイール/ピンチでズーム、ドラッグで パン
- クリックで選択 → [Inspector](inspector.md) に反映
- 関連モード中は始点→終点クリックで [Edge](/data-model/edge.md) 生成

# 画像書き出しとの関係

書き出し時はキャンバスの表示部を対象にする → [Image Export](/io/image-export.md)。
