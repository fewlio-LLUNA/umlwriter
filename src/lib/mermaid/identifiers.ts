/**
 * クラス名を Mermaid の識別子へ変換する（A1）。
 *
 * Mermaid のクラス名に使えるのは英数字（Unicode 可）・アンダースコア・ダッシュのみ。
 * 日本語名はそのまま通るが、空白や括弧が混ざると図が壊れるため置換が要る。
 * （空白やドットは実際にはパースが通ってしまうが、意図どおり解釈される保証がないので
 *   ドキュメントの規則に沿って保守的に倒す。設計書 §4-4-2 参照）
 */

import type { ClassNode } from "@/types/diagram";
import type { NameRegistry } from "@/lib/mermaid/types";

/** Mermaid のクラス名に使えない文字（英数字・Unicode 文字・`_`・`-` 以外）。 */
const INVALID_NAME_CHARS = /[^\p{L}\p{N}_-]/gu;

/** 名前が空になったクラスに割り当てる代替名。 */
const FALLBACK_NAME = "Class";

/**
 * Mermaid のクラス名規則に反する文字を `_` に置換する。
 * 置換の結果が空文字なら `Class` を返す。
 *
 * 例: `注文 (Order)` → `注文__Order_`
 */
export function sanitizeMermaidName(name: string): string {
  const replaced = name.replace(INVALID_NAME_CHARS, "_");
  return replaced.length > 0 ? replaced : FALLBACK_NAME;
}

/**
 * `used` に無い名前を返し、`used` へ登録する。衝突したら `_2`, `_3` … と連番を付ける。
 * クラス名と namespace 名の両方で使う。
 */
export function claimUniqueName(base: string, used: Set<string>): string {
  let unique = base;
  let suffix = 2;
  while (used.has(unique)) {
    unique = `${base}_${suffix}`;
    suffix += 1;
  }
  used.add(unique);
  return unique;
}

/**
 * 図の全クラスについて `ClassNode.id → Mermaid 識別子` の対応を作る。
 * サニタイズ後に名前が衝突したら連番を付けて一意にする。
 */
export function createNameRegistry(classes: ClassNode[]): NameRegistry {
  const idMap = new Map<string, string>();
  const usedNames = new Set<string>();

  for (const cls of classes) {
    idMap.set(cls.id, claimUniqueName(sanitizeMermaidName(cls.name), usedNames));
  }

  return { idOf: (classNodeId: string) => idMap.get(classNodeId) ?? null };
}
