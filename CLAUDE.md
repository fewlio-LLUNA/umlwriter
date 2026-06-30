## このプロジェクトの設計ナレッジ
実装方針・データ構造・UML記法・画面仕様は `uml-class-diagram-tool/`（OKFバンドル）を参照。
まず `uml-class-diagram-tool/index.md` を読んでから着手すること。

## Claudeアプリからの伝言
create-next-app の Tailwind オプションを使うのが一番堅い。 手動で入れると Tailwind v4 まわりで設定がズレやすいから、雛形生成時にまとめて入れてもらうのが安全。Claude Code は今のバージョンを見て組んでくれるはずだけど、もしスタイルが当たらなかったら「Tailwindのバージョンと設定ファイルが噛み合ってるか確認して」と一声かければ直る。
@xyflow/react は CSS のインポートが要る。 import '@xyflow/react/dist/style.css' を入れ忘れるとキャンバスが真っ白になるんだけど、これは「壊れた」んじゃなくて毎回みんなが踏む段差。
