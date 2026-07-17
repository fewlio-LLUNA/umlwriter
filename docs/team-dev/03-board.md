# タスクボード（協調の中枢） — Mermaid 記法 Markdown 書き出し

> 3セッションが**唯一リアルタイムに共有する状態**。ここで担当・進捗・境界を同期し、衝突を防ぐ。
> 更新したら即コミット（`docs: ボード更新`）。各ワーカーは**自分の行だけ**書き換える。
> 構造変更（タスク追加・境界変更・要相談の裁定）はリーダーOpusが行う。

最終更新: main-opus 2026-07-17（**単独セッションで実装完了**）

## 進め方の変更（2026-07-17）

規模が 3 セッションに割くほど大きくないと判断し、**単独セッションで L1 → A → B → L2 → L3 → L4 の順に通しで実装した**。
以下のオーナーシップとタスク分割は「実装の順序と境界」の記録として残す（モジュール構成はそのまま採用）。
再びチーム開発に戻す場合は `/design-handoff` でプロンプトと起動スクリプトを再生成すればよい。

## ファイルオーナーシップ（並行作業の境界）

- **Sonnet A**（クラスの内側）: `src/lib/mermaid/identifiers.ts`, `src/lib/mermaid/members.ts`, `src/lib/mermaid/classBlock.ts` ＋ それぞれの `*.test.ts`
- **Sonnet B**（クラスの外側）: `src/lib/mermaid/relations.ts`, `src/lib/mermaid/namespaces.ts` ＋ それぞれの `*.test.ts`
- **リーダーOpus**: `src/lib/mermaid/types.ts`, `src/lib/mermaid/document.ts`, `src/lib/exportMermaid.ts`, `src/components/Toolbar.tsx`, `src/components/DiagramEditor.tsx`, `package.json`, `vitest.config.ts`
- **共有（変更時はボードの「要相談」に起票しリーダーが裁定）**: `src/types/diagram.ts`, `src/lib/mermaid/types.ts`（L1 完了後は**凍結**）, 各種設定ファイル

> 原則: 自分のオーナー範囲の外は触らない。境界をまたぐ必要が出たら手を止めて「要相談」へ。
> ただし **read-only の import は自由**（B が A の `sanitizeMermaidName` を使うのは想定内。設計書 §4-3）。

## 作業ディレクトリ方針

- **同一作業ディレクトリ＋オーナーシップ分離＋頻繁な小コミット**（既定）。
- ファイルが1つも重ならないよう割ってあるので worktree は使わない。
- pull は小まめに。push 前に `git pull --rebase` すること。

## タスク一覧

状態: `未着手` → `作業中` → `レビュー待ち` → （`修正中`）→ `完了`

| ID | 内容 | 担当 | 状態 | 依存 | 主な対象ファイル |
|----|------|------|------|------|------------------|
| L1 | **土台づくり**: ①Vitest 導入 ②`mermaid/types.ts` に契約を実体化 ③要件 §8 の未確定3点を実物の描画で決着させ設計書 §4-4-2 に追記 ④`mermaid.parse()` のヘッドレス動作を検証 | L | **完了** | - | `package.json`, `vitest.config.ts`, `src/lib/mermaid/types.ts`, `docs/team-dev/02-design.md` |
| A1 | クラス名のサニタイズと `NameRegistry`。規則外文字を `_` に置換、衝突は連番で回避 | A | **完了** | L1 | `src/lib/mermaid/identifiers.ts` |
| A2 | 属性・操作の1行整形。可視性・static(`$`)・abstract(`*`)・戻り型・ジェネリクスの `~` 変換 | A | **完了** | L1 | `src/lib/mermaid/members.ts` |
| A3 | class ブロック組み立て。ステレオタイプ `<<...>>`、空の属性/操作の扱い | A | **完了** | A1, A2 | `src/lib/mermaid/classBlock.ts` |
| B1 | 関連6種 → 矢印。**汎化・実現は左右を入れ替える**（多重度も一緒に）。ラベル・多重度の省略 | B | **完了** | L1 | `src/lib/mermaid/relations.ts` |
| B2 | パッケージの包含判定 → `PackageGrouping`。左上座標で判定、重なりは内側（面積が小さい方）優先 | B | **完了** | L1 | `src/lib/mermaid/namespaces.ts` |
| L2 | 全体組み立て `diagramToMermaid`。namespace の字下げ、空図の扱い | L | **完了** | A3, B1, B2 | `src/lib/mermaid/document.ts` |
| L3 | ダウンロード導線＋ツールバーのボタン＋配線 | L | **完了** | L2 | `src/lib/exportMermaid.ts`, `src/components/Toolbar.tsx`, `src/components/DiagramEditor.tsx` |
| L4 | 受け入れ確認。実ブラウザで書き出し、出力を Mermaid パーサに通す。既存書き出しの回帰チェック | L | **完了** | L3 | - |

## 検証結果（L4 / 2026-07-17）

Playwright で実アプリを操作し、JSON 読み込み → Mermaid 書き出しまで通した結果、
**受け入れ条件 9 項目のうち 8 項目が OK**。汎化の向き・サニタイズ・表示ラベル・ステレオタイプ・
static / abstract の分類子・namespace の内外はすべて意図どおり。単体テストは 49 件通過。

## 要相談 / 申し送り

- **【残課題】多重度（F6）が実際には出力されない。原因は本機能の外にある既存バグ。**
  `src/lib/diagramToFlow.ts:69` が関連線について `kind` と `label` しか React Flow の
  `data` に載せておらず、多重度・ロール名が **Diagram → React Flow の時点で捨てられている**。
  そのため書き出し（JSON / Mermaid とも `flowToDiagram` を経由する）に多重度は決して現れない。
  - 実測: `sourceMultiplicity:"1"` を含む JSON を読み込ませ、**既存の JSON 書き出し**を踏むと
    その項目が消える。つまり Mermaid 書き出し固有の問題ではなく、JSON ラウンドトリップの欠落。
  - `relations.ts` 側は多重度を正しく扱えており（単体テスト済み）、上流が運べば自動的に出力される。
  - 多重度の編集 UI 自体が未実装（ロードマップ「次の波」）のため実害は現状小さいが、
    手書き JSON を読ませると黙って情報が失われる点は独立したバグとして扱うのが妥当。
  - 対応するなら `diagramToFlow.ts` の `UmlEdgeData` に 4 項目（多重度 2・ロール 2）を追加する小改修。
    既存挙動（共同編集の同期を含む）に触れるため、**本機能とは別コミットにすべき**。
