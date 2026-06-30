# UML クラス図エディタ（UMLwriter）

ブラウザ完結（バックエンドなし）の UML クラス図 作図ツール。
Next.js (App Router) + TypeScript + [@xyflow/react](https://reactflow.dev/)（旧 React Flow）で実装し、Vercel へデプロイする。

設計・仕様のナレッジは [`uml-class-diagram-tool/`](./uml-class-diagram-tool/index.md) を参照。

## 現在のフェーズ

**Phase 0**: プロジェクト雛形と空のキャンバス（ズーム / パン可）まで。

- ズーム / パン / フィット操作・背景グリッド・ミニマップが動作する空キャンバスを 1 画面表示
- データモデルの型を [`src/types/diagram.ts`](./src/types/diagram.ts) に定義済み（まだ描画には未使用）

クラス追加・関連線・インスペクタ・JSON 入出力などは後続フェーズで実装する。

## 技術スタック

| 領域           | 採用                              |
| -------------- | --------------------------------- |
| フレームワーク | Next.js (App Router) + TypeScript |
| 作図エンジン   | `@xyflow/react`                   |
| スタイリング   | Tailwind CSS v4                   |
| ホスティング   | Vercel                            |

## 必要環境

- Node.js 20 以上（推奨: 最新 LTS）
- npm

## 開発手順

```bash
# 依存パッケージのインストール
npm install

# 開発サーバ起動（http://localhost:3000）
npm run dev
```

ブラウザで http://localhost:3000 を開くと、空のキャンバスが表示される。

その他のコマンド:

```bash
npm run build   # 本番ビルド
npm run start   # ビルド成果物をローカルで起動
npm run lint    # ESLint
```

## ディレクトリ構成（抜粋）

```
src/
  app/
    layout.tsx          ルートレイアウト
    page.tsx            トップページ（キャンバスを表示）
    globals.css         グローバルスタイル（Tailwind）
  components/
    DiagramCanvas.tsx   空の作図キャンバス（@xyflow/react）
  types/
    diagram.ts          UML データモデルの型定義
uml-class-diagram-tool/  設計・仕様ナレッジ（OKF バンドル）
```

## デプロイ（Vercel）

クライアント完結のため、SSR / API ルートは不要。

1. このリポジトリを GitHub に push する
2. [Vercel](https://vercel.com/) で「New Project」からリポジトリを import
3. フレームワークは **Next.js** が自動検出される。ビルド設定はデフォルトのままで可
4. Deploy を実行すると、push のたびに自動デプロイされる

ローカルから直接デプロイする場合は [Vercel CLI](https://vercel.com/docs/cli) を使う:

```bash
npx vercel        # プレビューデプロイ
npx vercel --prod # 本番デプロイ
```
