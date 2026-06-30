---
type: Data Schema
title: Edge（関連線）
description: 2 つのクラスを結ぶ関連。種類・多重度・ロール名を持つ。
tags: [schema, edge, relationship]
timestamp: 2026-06-30T00:00:00Z
---

# Schema

```ts
interface Edge {
  id: string;
  source: string;            // 始点 ClassNode.id
  target: string;            // 終点 ClassNode.id
  kind: RelationKind;        // 関連の種類
  label?: string;            // 関連名（任意）
  sourceMultiplicity?: string;  // 始点側の多重度 例 "1" "*" "0..1" "1..*"
  targetMultiplicity?: string;  // 終点側の多重度
  sourceRole?: string;          // 始点側のロール名
  targetRole?: string;          // 終点側のロール名
}

type RelationKind =
  | "association"      // 関連
  | "aggregation"      // 集約
  | "composition"      // コンポジション
  | "generalization"   // 汎化（継承）
  | "realization"      // 実現
  | "dependency";      // 依存
```

# 方向の約束

`source` → `target` の向きで意味を固定する。各 `kind` での記号の付き方は
[Relationships](/uml-notation/relationships.md) に集約。
- 汎化/実現: `target` が親 / インターフェース（白三角が `target` 側）
- 集約/コンポジション: `source` が全体（ダイヤが `source` 側）

# 種類変更

`kind` を差し替えるだけで矢印・線種・終端記号が変わる設計にする
（カスタムエッジの SVG マーカーを `kind` で切替）。多重度・ロールは MVP では器のみ用意し、UI は次の波。

# 親

[Diagram](/data-model/diagram.md) の `edges` に格納される。
