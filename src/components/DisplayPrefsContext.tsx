"use client";

import { createContext, useContext } from "react";

/**
 * 図全体の表示オプション。
 *
 * メンバのフラグ（isStatic / isAbstract）はデータとして常に保持しつつ、
 * その「見た目の装飾」を図全体で表示するかどうかだけを切り替える。
 * 各ノードの data ではなく Context で配り、トグルで全ノードを書き換えないようにする。
 */
export interface DisplayPrefs {
  /** static を下線で表示するか。 */
  showStaticUnderline: boolean;
  /** abstract を斜体で表示するか。 */
  showAbstractItalic: boolean;
}

/** 既定はどちらも表示 ON。 */
export const DEFAULT_DISPLAY_PREFS: DisplayPrefs = {
  showStaticUnderline: true,
  showAbstractItalic: true,
};

const DisplayPrefsContext = createContext<DisplayPrefs>(DEFAULT_DISPLAY_PREFS);

export const DisplayPrefsProvider = DisplayPrefsContext.Provider;

/** カスタムノードから表示オプションを参照する。 */
export function useDisplayPrefs(): DisplayPrefs {
  return useContext(DisplayPrefsContext);
}
