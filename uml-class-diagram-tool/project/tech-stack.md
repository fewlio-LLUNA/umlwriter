---
type: Decision
title: 技術選定
description: Next.js + TypeScript + React Flow を核に、Vercel へデプロイする構成。
tags: [nextjs, react-flow, typescript, vercel]
timestamp: 2026-06-30T00:00:00Z
---

# 採用スタック

| 領域 | 採用 | 理由 |
|------|------|------|
| フレームワーク | Next.js (App Router) + TypeScript | Vercel と相性が良く、型でデータ構造を縛れる |
| 作図エンジン | `@xyflow/react`（旧 React Flow） | ノードのドラッグ・エッジの自動再ルーティング・ズーム/パンを標準提供 |
| スタイリング | Tailwind CSS（任意） | インスペクタ等の UI を素早く組む |
| バリデーション | zod | JSON 読み込み時のスキーマ検証 |
| 画像書き出し | `html-to-image` | DOM を SVG / PNG 化 → [Image Export](/io/image-export.md) |
| ホスティング | Vercel | GitHub 連携でそのままデプロイ |

# 中核の判断

関連線の自動追従は本アプリの最難関に見えるが、`@xyflow/react` の守備範囲。
ノード移動に対するエッジ再描画・接続点（handle）管理をライブラリに任せ、
自前の座標計算を書かない。これが開発体力を桁で変える分岐点になる。

クラスの箱は React Flow の **カスタムノード**、関連線は **カスタムエッジ**（SVG マーカー）で実装する。
→ 描画の詳細は [Canvas](/ui/canvas.md) と [Relationships](/uml-notation/relationships.md)。

# 状態管理

図全体（[Diagram](/data-model/diagram.md)）を単一の状態ツリーで保持する。
Zustand など軽量ストアを使うと React Flow の `nodes` / `edges` と分離しやすい（任意）。

# デプロイ

クライアント完結のため SSR/API ルートは不要。静的書き出し相当でよく、Vercel デプロイは最も軽い工程になる。
