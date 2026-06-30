---
type: UI Spec
title: ツールバー
description: 上部に並ぶ主要アクション。
tags: [ui, toolbar]
timestamp: 2026-06-30T00:00:00Z
---

# アクション

- **クラス追加**: 新しい [ClassNode](/data-model/class-node.md) をキャンバス中央に置く
- **関連モード**: クリックで始点→終点クラスを選び [Edge](/data-model/edge.md) を作る
- **JSON 書き出し / 読み込み**: → [JSON Persistence](/io/json-persistence.md)
- **画像書き出し（SVG / PNG）**: → [Image Export](/io/image-export.md)
- **ズーム調整 / 全体表示（fit）**: キャンバス操作の補助
- **元に戻す / やり直し**（任意・MVP 後）

# 備考

関連モードは「今どのモードか」を明示する（カーソルやハイライト）。誤接続を防ぐ。
