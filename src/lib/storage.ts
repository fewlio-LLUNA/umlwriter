/**
 * Diagram の localStorage 永続化（自動保存 / リロード復帰）。
 *
 * ブラウザ完結アプリのため、図全体をブラウザの localStorage に丸ごと保存する。
 * 読み込み時は schemaVersion のメジャーを確認し、未知のメジャーは読み捨てる
 * （将来のフォーマット変更で壊れたデータを復元しないため）。
 */

import type { Diagram } from "@/types/diagram";
import {
  DEFAULT_DISPLAY_PREFS,
  type DisplayPrefs,
} from "@/components/DisplayPrefsContext";

/** 現行スキーマ版。メジャーが上がると後方互換を切る目印。 */
export const SCHEMA_VERSION = "1.0";

/** localStorage のキー。版番号を含めて衝突を避ける。 */
const STORAGE_KEY = "umlwriter.diagram.v1";

/** 表示オプション（ビュー設定）のキー。図データとは別管理。 */
const VIEW_PREFS_KEY = "umlwriter.view.v1";

/** schemaVersion 文字列からメジャー番号（"1.0" → "1"）を取り出す。 */
function majorOf(version: string): string {
  return version.split(".")[0];
}

/** Diagram を localStorage に保存する。書き込み失敗は握りつぶす（保存は副次機能のため）。 */
export function saveDiagram(diagram: Diagram): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(diagram));
  } catch {
    // 容量超過やプライベートモード等。保存できなくても編集自体は続行させる。
  }
}

/**
 * localStorage から Diagram を読み込む。
 * 未保存・壊れたデータ・互換性のないメジャー版は null を返す（呼び出し側は空図で開始）。
 */
export function loadDiagram(): Diagram | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Diagram>;
    // 最低限の形チェック。クラス配列が無ければ復元しない。
    if (!parsed || !Array.isArray(parsed.classes)) return null;

    if (majorOf(parsed.schemaVersion ?? "") !== majorOf(SCHEMA_VERSION)) {
      console.warn(
        `保存データの schemaVersion (${parsed.schemaVersion}) が非対応のため読み込みを中止しました。`
      );
      return null;
    }

    return {
      schemaVersion: parsed.schemaVersion ?? SCHEMA_VERSION,
      classes: parsed.classes,
      edges: parsed.edges ?? [],
      packages: parsed.packages ?? [],
      notes: parsed.notes ?? [],
    };
  } catch {
    return null;
  }
}

/** 表示オプションを保存する（失敗は握りつぶす）。 */
export function saveViewPrefs(prefs: DisplayPrefs): void {
  try {
    localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // 保存できなくても表示自体は続行させる。
  }
}

/** 表示オプションを読み込む。未保存・壊れたデータは既定値で補う。 */
export function loadViewPrefs(): DisplayPrefs {
  try {
    const raw = localStorage.getItem(VIEW_PREFS_KEY);
    if (!raw) return DEFAULT_DISPLAY_PREFS;
    const parsed = JSON.parse(raw) as Partial<DisplayPrefs>;
    return {
      showStaticUnderline:
        parsed.showStaticUnderline ?? DEFAULT_DISPLAY_PREFS.showStaticUnderline,
      showAbstractItalic:
        parsed.showAbstractItalic ?? DEFAULT_DISPLAY_PREFS.showAbstractItalic,
    };
  } catch {
    return DEFAULT_DISPLAY_PREFS;
  }
}
