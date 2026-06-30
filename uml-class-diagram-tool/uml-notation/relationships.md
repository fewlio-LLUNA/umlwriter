---
type: UML Convention
title: 関連の種類（6 種）と終端記号
description: association / aggregation / composition / generalization / realization / dependency の線種と矢印。
tags: [uml, relationship, edge, marker]
timestamp: 2026-06-30T00:00:00Z
---

# 6 種の関連

`source` → `target` の向きを前提に、線種と終端記号を定める。

| kind | 日本語 | 線種 | 終端記号（付く側） | 意味 |
|------|--------|------|--------------------|------|
| `association`    | 関連       | 実線 | なし／開矢印（任意, target 側） | 単純な結びつき |
| `aggregation`    | 集約       | 実線 | 白いダイヤ（source=全体 側） | 緩い「持つ」関係 |
| `composition`    | コンポジション | 実線 | 塗りダイヤ（source=全体 側） | 強い「持つ」関係（生存期間を共有） |
| `generalization` | 汎化（継承） | 実線 | 白い三角（target=親 側） | is-a |
| `realization`    | 実現       | 破線 | 白い三角（target=interface 側） | インターフェース実装 |
| `dependency`     | 依存       | 破線 | 開矢印（target 側） | 一時的に使う |

# 実装

React Flow の **カスタムエッジ** + SVG `marker` 定義で描く。
`kind` を見てマーカーと `strokeDasharray`（破線）を切り替える。
ダイヤ・白三角・塗り三角・開矢印の 4 種のマーカーを用意すれば全種を表現できる。

# 付加情報（多重度・ロール）

各端に多重度（`1` `*` `0..1` `1..*`）とロール名を線の端付近に小さく描画できる。
データは [Edge](/data-model/edge.md) の `sourceMultiplicity` / `targetMultiplicity` / `sourceRole` / `targetRole`。
編集 UI は次の波 → [Scope & Roadmap](/project/scope-roadmap.md)。

# 種類変更の UX

エッジ選択 → [Inspector](/ui/inspector.md) の種類セレクトで `kind` を差し替え。線が即座に描き変わる。
