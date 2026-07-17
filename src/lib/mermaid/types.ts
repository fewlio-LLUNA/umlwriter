/**
 * Mermaid 書き出しの共有の型・定数。
 *
 * 設計書 `docs/team-dev/02-design.md` §4 のインターフェース契約を実体化したもの。
 * 各モジュール（identifiers / members / classBlock / relations / namespaces / document）
 * はこの契約だけを介して繋がる。
 */

import type { ClassNode, PackageNode } from "@/types/diagram";

/** ClassNode.id → Mermaid のクラス識別子（サニタイズ済み・図内で一意）を引く。 */
export interface NameRegistry {
  /** 未知の id には null を返す（壊れたエッジを黙って落とすため）。 */
  idOf(classNodeId: string): string | null;
}

/** クラスをパッケージへ振り分けた結果。 */
export interface PackageGrouping {
  /** namespace として出すパッケージと、その所属クラス（Diagram の並び順を保つ）。 */
  grouped: { pkg: PackageNode; classes: ClassNode[] }[];
  /** どのパッケージにも属さないクラス（namespace の外に出す）。 */
  ungrouped: ClassNode[];
}

/** Mermaid のインデント 1 段（半角スペース 4 つ）。 */
export const INDENT = "    ";
