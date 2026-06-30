/**
 * 新規 ClassNode の生成ファクトリ。
 *
 * ツールバーの「クラス追加」から呼ばれ、最小構成（名前のみ・属性/操作なし）の
 * クラスを作る。属性・操作の追加や名前変更は Inspector（次フェーズ）で行う。
 */

import type { ClassNode } from "@/types/diagram";

/** 追加直後のクラスにつける既定名。 */
const DEFAULT_CLASS_NAME = "NewClass";

/** 指定座標に空のクラス（通常ステレオタイプ）を生成する。ID は一意に採番する。 */
export function createEmptyClass(position: { x: number; y: number }): ClassNode {
  return {
    id: crypto.randomUUID(),
    name: DEFAULT_CLASS_NAME,
    stereotype: "none",
    attributes: [],
    operations: [],
    position,
  };
}
