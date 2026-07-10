/**
 * 新規 PackageNode の生成ファクトリ。
 *
 * ツールバーの「パッケージ追加」から呼ばれ、既定サイズの空パッケージを作る。
 * 名前変更・リサイズは追加後に Inspector / キャンバスで行う。
 */

import type { PackageNode } from "@/types/diagram";

/** 追加直後のパッケージにつける既定名。 */
const DEFAULT_PACKAGE_NAME = "NewPackage";
/** 追加時の既定サイズ（あとで手動リサイズ）。 */
const DEFAULT_PACKAGE_WIDTH = 320;
const DEFAULT_PACKAGE_HEIGHT = 200;

/** 指定座標に既定サイズの空パッケージを生成する。ID は一意に採番する。 */
export function createEmptyPackage(position: {
  x: number;
  y: number;
}): PackageNode {
  return {
    id: crypto.randomUUID(),
    name: DEFAULT_PACKAGE_NAME,
    position,
    width: DEFAULT_PACKAGE_WIDTH,
    height: DEFAULT_PACKAGE_HEIGHT,
  };
}
