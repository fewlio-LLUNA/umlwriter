---
type: Project Overview
title: プロジェクト概要
description: UML クラス図だけに特化したブラウザ完結の作図 Web アプリ。
tags: [uml, class-diagram, vercel]
timestamp: 2026-06-30T00:00:00Z
---

# 目的

UML のクラス図「だけ」を手軽に描けるエディタを作る。汎用作図ツールにはしない。
対象を 1 図種に絞ることでデータ構造・操作・描画が閉じ、個人開発で完成まで持っていける規模にする。

# 提供する操作（ユーザー要件）

- クラスの追加 / 編集 / 削除
- ステレオタイプ設定（abstract / interface / enumeration）
- 属性「名前: 型」の追加・編集・削除
- 操作「名前(引数): 戻り型」の追加・編集・削除
- 可視性の 4 択選択（public / private / protected / package）→ [Visibility](/uml-notation/visibility.md)
- クラス名・属性・操作への任意の説明文（例: `Book  本クラス`）
- クラス間の関連の追加と種類変更 → [Relationships](/uml-notation/relationships.md)
- クラスの配置移動と、それに追従する関連線の自動再描画
- 作図データの JSON 書き出し / 読み込み → [JSON Persistence](/io/json-persistence.md)
- 図の画像書き出し（SVG / PNG）→ [Image Export](/io/image-export.md)

# 補完した UML 要素（「他、UML に必要なもの」）

- 関連の多重度（`1` `*` `0..1` `1..*`）とロール名
- static メンバの下線、abstract 操作の斜体表示 → [Member Rendering](/uml-notation/member-rendering.md)
- ノート（コメント）の箱 → [Notes](/uml-notation/notes-comments.md)

# 非ゴール

- シーケンス図・ユースケース図など他の図種（クラス図に専念）
- リアルタイム共同編集・アカウント機能（MVP では持たない）
- コード（Java/TS 等）からの自動リバース生成（将来検討）

# 制約

- バックエンドを持たないクライアント完結アプリ。データはブラウザ内に閉じる。
- ホスティングは Vercel。→ [Tech Stack](/project/tech-stack.md)
