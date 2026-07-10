"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps, type Node } from "@xyflow/react";

import type { PackageNode as PackageNodeData } from "@/types/diagram";

/**
 * React Flow のカスタムノード型。`data` に永続データの PackageNode を載せる。
 * `type: "umlPackage"` で DiagramCanvas の nodeTypes に対応づける。
 */
export type PackageFlowNode = Node<{ packageNode: PackageNodeData }, "umlPackage">;

/** リサイズの下限。潰しすぎて掴めなくならないための最小サイズ。 */
const MIN_WIDTH = 140;
const MIN_HEIGHT = 90;

/**
 * UML パッケージ（フォルダ型の枠）。
 *
 * 左上の小さなタブ＋本体の矩形でフォルダ形状を描く。本体は塗らず（透明）、
 * 背面に重なるクラスが透けて見えるようにする。選択時は NodeResizer の
 * ハンドル・枠線だけで表現し、画像書き出しでは除外される（本体の枠は残る）。
 */
function PackageNodeComponent({ data, selected }: NodeProps<PackageFlowNode>) {
  const { packageNode } = data;
  return (
    <div className="uml-package-box relative h-full w-full">
      {/* 選択時のみリサイズハンドルを表示。これが選択の視覚表現も兼ねる。 */}
      <NodeResizer
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        isVisible={selected}
        lineClassName="!border-blue-400"
        handleClassName="!border-blue-500 !bg-white"
      />

      {/* 左上タブ（下辺は本体と重なるので引かない）。名前を表示。
          パッケージの選択・移動はこのタブで行う（本体はクリックを背面へ透過）。 */}
      <div className="uml-package-tab absolute left-0 top-0 flex h-6 min-w-[96px] max-w-[70%] cursor-move items-center rounded-t-sm border border-b-0 border-slate-500 bg-white/90 px-2 text-xs font-medium text-slate-600">
        <span className="truncate">{packageNode.name}</span>
      </div>

      {/* 本体（ほぼ透明・背面のクラスが透ける）。上辺はタブの下に続く。 */}
      <div className="absolute inset-x-0 bottom-0 top-6 rounded-b-sm rounded-tr-sm border border-slate-500" />
    </div>
  );
}

// 親（DiagramCanvas）の再描画でノード本体が無駄に作り直されないよう memo 化する。
export const PackageNode = memo(PackageNodeComponent);
