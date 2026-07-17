/**
 * パッケージ枠の中にあるクラスを振り分ける（B2）。
 *
 * 本アプリのパッケージは「見た目だけの枠」で、中のクラスとの親子関係をデータとして
 * 持っていない。そのため書き出し時に **座標の包含判定** で所属を復元する。
 */

import type { ClassNode, PackageNode } from "@/types/diagram";
import type { PackageGrouping } from "@/lib/mermaid/types";

/**
 * クラスをパッケージへ振り分ける。
 *
 * 判定はクラスの **左上座標** が枠の矩形に入っているかだけを見る簡易版
 * （クラスの実寸は測らない。要件 §8-4 で合意済みの割り切り）。
 * 複数の枠に重なるときは **面積が小さい枠＝内側** を優先する。
 */
export function groupClassesByPackage(
  classes: ClassNode[],
  packages: PackageNode[]
): PackageGrouping {
  const members = new Map<string, ClassNode[]>();
  const ungrouped: ClassNode[] = [];

  for (const cls of classes) {
    const owner = findOwnerPackage(cls, packages);
    if (owner === null) {
      ungrouped.push(cls);
      continue;
    }
    const bucket = members.get(owner.id);
    if (bucket) {
      bucket.push(cls);
    } else {
      members.set(owner.id, [cls]);
    }
  }

  // クラスが 1 つも入っていないパッケージは namespace として出さない（空の namespace は書けない）。
  const grouped = packages
    .filter((pkg) => members.has(pkg.id))
    .map((pkg) => ({ pkg, classes: members.get(pkg.id) ?? [] }));

  return { grouped, ungrouped };
}

/** クラスを含む枠のうち最も内側（面積が最小）のものを返す。どれにも入らなければ null。 */
function findOwnerPackage(
  cls: ClassNode,
  packages: PackageNode[]
): PackageNode | null {
  let owner: PackageNode | null = null;
  for (const pkg of packages) {
    if (!containsPosition(pkg, cls.position)) continue;
    if (owner === null || area(pkg) < area(owner)) {
      owner = pkg;
    }
  }
  return owner;
}

/** 座標が枠の矩形の中にあるか（境界上を含む）。 */
function containsPosition(
  pkg: PackageNode,
  position: { x: number; y: number }
): boolean {
  return (
    position.x >= pkg.position.x &&
    position.x <= pkg.position.x + pkg.width &&
    position.y >= pkg.position.y &&
    position.y <= pkg.position.y + pkg.height
  );
}

/** 枠の面積。内側／外側の判定に使う。 */
function area(pkg: PackageNode): number {
  return pkg.width * pkg.height;
}
