# 共同編集（リンク共有）機能

リンクを知っている人だけが、同じ図をリアルタイムに同時編集できる機能。
認証は不要で、URL の `?room=<推測困難なID>` が入室の鍵になる。

## 仕組み

- **同期基盤**: Cloudflare Durable Objects 上で動く Yjs（CRDT）。`party/server.ts`。
  - room（＝共有ID）ごとに Durable Object が 1 つ立ち、接続者全員の変更をマージ・配信する。
  - y-partyserver がWebSocket・同期・Awareness（プレゼンス）を担当。
- **クライアント**: `src/lib/collab/` のフックが Yjs ドキュメントを React Flow の状態へ射影する。
  - `?room` があれば共同編集モード、無ければ従来のローカル（localStorage）モード。
- **競合解決**: ノード / エッジ単位の last-write-wins。別々の要素の同時編集は衝突しない。
- **永続化**: Cloudflare KV に保存し、`expirationTtl` で **最終編集から 10 日** で自動失効。
- **引き継ぎ**: 「共有して同時編集」を押すと、その時点の図を引き継いだ新しい room を作る。
  既存の room に入ったときは共有データを優先し、ローカルの図では上書きしない。

## ローカルで動かす

2 つのプロセスを並行起動する。

```bash
# 1) 同期サーバー（Cloudflare Worker のローカル実行）
npm run sync:dev          # http://localhost:8787 で待ち受け

# 2) アプリ本体
npm run dev               # http://localhost:3000
```

- アプリ上部の「🔗 共有して同時編集」を押すと `?room=...` 付きURLに遷移する。
- そのURLを別タブ / 別ブラウザで開くと、同じ図が同期される。
- クライアントが繋ぐ同期サーバーは環境変数 `NEXT_PUBLIC_SYNC_HOST` で指定（未設定なら `localhost:8787`）。

## 本番デプロイ

同期サーバー（Cloudflare）とアプリ（現状のホスト）を別々にデプロイする。

### 1. 同期サーバー（Cloudflare Workers）

```bash
# KV 名前空間を作成し、出力された id を wrangler.jsonc の
# kv_namespaces[].id（REPLACE_WITH_KV_NAMESPACE_ID）に貼る
npx wrangler kv namespace create DIAGRAMS

# デプロイ
npm run sync:deploy
```

デプロイ後のホスト（例 `umlwriter-sync.<account>.workers.dev`）を控える。

### 2. アプリ

ホスティング先（Vercel など）の環境変数に、上のホストを設定する。

```
NEXT_PUBLIC_SYNC_HOST=umlwriter-sync.<account>.workers.dev
```

https ページからは自動で `wss://` 接続になる。

## 注意

- **「リンクを知る人だけ」＝ URL が漏れれば誰でも入れる**方式。特定メンバー限定や追い出しが要るなら別途認証が必要。
- 同じ要素の同じ項目を 2 人が同時に編集した場合のみ後勝ちになる。
- KV の 10 日は「最終編集からの経過」で判定するため、編集が続く限り room は延命される。
