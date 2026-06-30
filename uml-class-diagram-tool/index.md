---
okf_version: "0.1"
---

# UML クラス図エディタ — Knowledge Bundle

UML のクラス図「だけ」に特化した Web アプリの設計・実装ナレッジ。
producer は人間（Miliba）、consumer は Claude Design（画面設計）と Claude Code（実装）を想定している。
ブラウザ完結（バックエンドなし）・Vercel デプロイが前提。

# Project

* [Overview](project/overview.md) - 何を作るか、スコープ、非ゴール
* [Tech Stack](project/tech-stack.md) - 採用技術と選定理由
* [Scope & Roadmap](project/scope-roadmap.md) - MVP と後回しにする機能の線引き

# Data Model

* [Diagram](data-model/diagram.md) - 図全体のルート構造
* [ClassNode](data-model/class-node.md) - クラスの箱
* [Attribute](data-model/attribute.md) - 属性（フィールド）
* [Operation](data-model/operation.md) - 操作（メソッド）
* [Edge](data-model/edge.md) - クラス間の関連線

# UML Notation

* [Visibility](uml-notation/visibility.md) - 可視性 4 択の記法
* [Stereotypes](uml-notation/stereotypes.md) - abstract / interface / enumeration
* [Member Rendering](uml-notation/member-rendering.md) - static 下線・abstract 斜体などの描き分け
* [Relationships](uml-notation/relationships.md) - 6 種の関連と矢印・記号
* [Notes](uml-notation/notes-comments.md) - ノート（コメント）の箱

# UI

* [Layout](ui/layout.md) - 3 ペイン構成（Design 向けの基点）
* [Toolbar](ui/toolbar.md) - 上部ツールバー
* [Inspector](ui/inspector.md) - 右側の編集パネル
* [Canvas](ui/canvas.md) - 中央の作図キャンバス

# IO

* [JSON Persistence](io/json-persistence.md) - JSON 書き出し / 読み込み / 自動保存
* [Image Export](io/image-export.md) - SVG / PNG 画像書き出し
