---
type: Roadmap
title: スコープとロードマップ
description: MVP の範囲と、後の波に回す機能の線引き。
tags: [mvp, roadmap]
timestamp: 2026-06-30T00:00:00Z
---

# MVP（最初に出す）

- クラスの箱の追加 / 編集 / 削除（名前・ステレオタイプ・説明）
- 属性・操作の追加 / 編集 / 削除（可視性 4 択・型・説明）
- 6 種の関連の追加と種類変更 → [Relationships](/uml-notation/relationships.md)
- ドラッグでの配置移動と関連線の自動追従
- JSON 書き出し / 読み込み → [JSON Persistence](/io/json-persistence.md)
- SVG / PNG 画像書き出し → [Image Export](/io/image-export.md)
- localStorage への自動保存（リロード復帰）

# 次の波（MVP 後）

- 多重度・ロール名の編集 UI（データ構造は MVP から確保しておく）→ [Edge](/data-model/edge.md)
- static 下線・abstract 斜体の表示切替 → [Member Rendering](/uml-notation/member-rendering.md)
- ノート（コメント）の箱 → [Notes](/uml-notation/notes-comments.md)
- enumeration の値リスト表示

# 将来検討（やるなら）

- クラウド保存（別端末で続きを編集）。太鼓スコアビューアーで触れた Supabase をそのまま足せる構成にしておく
- 整列・自動レイアウト（dagre / elk）
- クラス図 → コード雛形の書き出し

# 線引きの方針

データ構造（[Data Model](/data-model/diagram.md)）には多重度やロールの器を最初から用意し、
**UI の実装だけを段階投入**する。後から器を作り直す手戻りを避けるため。
