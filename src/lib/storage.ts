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

/** ペイン幅（レイアウト）のキー。図データ・表示オプションとは別管理。 */
const LAYOUT_KEY = "umlwriter.layout.v1";

/** インスペクタ幅の下限・上限・既定（px）。既定は従来の固定幅（w-80）と同じ。 */
export const INSPECTOR_MIN_WIDTH = 240;
export const INSPECTOR_MAX_WIDTH = 720;
export const INSPECTOR_DEFAULT_WIDTH = 320;

/** キャンバスに必ず残す幅（px）。狭い窓でインスペクタが作図領域を潰さないため。 */
const MIN_CANVAS_WIDTH = 320;

/**
 * インスペクタ幅を下限・上限、およびウィンドウ幅に収める。
 * 窓が狭いときは上限側をウィンドウ幅に合わせて縮める（下限は必ず守る）。
 */
export function clampInspectorWidth(width: number): number {
  const available =
    typeof window === "undefined"
      ? INSPECTOR_MAX_WIDTH
      : window.innerWidth - MIN_CANVAS_WIDTH;
  const max = Math.max(
    INSPECTOR_MIN_WIDTH,
    Math.min(INSPECTOR_MAX_WIDTH, available)
  );
  return Math.round(Math.min(Math.max(width, INSPECTOR_MIN_WIDTH), max));
}

/** インスペクタ幅を保存する（失敗は握りつぶす）。 */
export function saveInspectorWidth(width: number): void {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify({ inspectorWidth: width }));
  } catch {
    // 保存できなくてもレイアウト自体は続行させる。
  }
}

/** インスペクタ幅を読み込む。未保存・壊れたデータは既定幅で補う。 */
export function loadInspectorWidth(): number {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (!raw) return INSPECTOR_DEFAULT_WIDTH;
    const parsed = JSON.parse(raw) as { inspectorWidth?: unknown };
    return typeof parsed.inspectorWidth === "number"
      ? clampInspectorWidth(parsed.inspectorWidth)
      : INSPECTOR_DEFAULT_WIDTH;
  } catch {
    return INSPECTOR_DEFAULT_WIDTH;
  }
}

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
