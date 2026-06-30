---
type: UI Spec
title: インスペクタ（編集パネル）
description: 選択した要素の中身を編集する右ペイン。
tags: [ui, inspector, form]
timestamp: 2026-06-30T00:00:00Z
---

# クラス選択時

- クラス名（テキスト）
- ステレオタイプ（none / abstract / interface / enumeration）→ [Stereotypes](/uml-notation/stereotypes.md)
- 説明（テキスト・任意）例: `本クラス`
- 属性リスト: 行ごとに〔可視性セレクト〕〔名前〕〔型〕〔説明〕〔static〕〔削除〕、末尾に追加ボタン
- 操作リスト: 行ごとに〔可視性〕〔名前〕〔引数〕〔戻り型〕〔説明〕〔static〕〔abstract〕〔削除〕、末尾に追加ボタン
- クラス削除ボタン（関連も連動削除）

参照: [Attribute](/data-model/attribute.md) / [Operation](/data-model/operation.md) / [Visibility](/uml-notation/visibility.md)

# 関連選択時

- 種類セレクト（6 択）→ [Relationships](/uml-notation/relationships.md)
- 関連名（任意）
- 多重度（始点 / 終点）・ロール名（始点 / 終点）※ MVP 後
- 関連削除ボタン

# 設計方針

編集は基本インスペクタに集約し、キャンバス上は配置と選択に専念させる。
入力は即時反映（双方向バインド）。
