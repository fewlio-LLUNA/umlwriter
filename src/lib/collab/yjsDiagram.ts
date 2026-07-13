/**
 * Yjs の共有 Map ⇄ React Flow 表現の変換。
 *
 * 共有ドキュメントは 2 つの Y.Map で持つ:
 *   - "nodes": id → YNodeRecord（クラス or パッケージ）
 *   - "edges": id → YEdgeRecord（関連線）
 * id 単位で値を差し替える last-write-wins 方式。別々の要素を同時に編集しても
 * 衝突しない（同じ要素の同時編集のみ後勝ち）。
 */

import type { AppFlowNode } from "@/lib/diagramToFlow";
import {
  classToFlowNode,
  packageToFlowNode,
  isPackageNode,
  diagramEdgeToFlowEdge,
} from "@/lib/diagramToFlow";
import type {
  ClassNode,
  PackageNode,
  Edge as DiagramEdge,
} from "@/types/diagram";
import type { UmlFlowEdge } from "@/components/edges/UmlEdge";

/** 共有 Map に入れるノード 1 件（種別付き）。 */
export type YNodeRecord =
  | { kind: "class"; node: ClassNode }
  | { kind: "package"; node: PackageNode };

/** 共有 Map に入れる関連 1 件（永続用 Edge と同形）。 */
export type YEdgeRecord = DiagramEdge;

/**
 * React Flow ノード → 共有レコード。
 * ドラッグ後の座標・リサイズ後のサイズを正として取り込む。
 */
export function flowNodeToRecord(node: AppFlowNode): YNodeRecord {
  if (isPackageNode(node)) {
    return {
      kind: "package",
      node: {
        ...node.data.packageNode,
        position: node.position,
        width: node.width ?? node.data.packageNode.width,
        height: node.height ?? node.data.packageNode.height,
      },
    };
  }
  return {
    kind: "class",
    node: { ...node.data.classNode, position: node.position },
  };
}

/** 共有レコード → React Flow ノード。 */
export function recordToFlowNode(record: YNodeRecord): AppFlowNode {
  return record.kind === "package"
    ? packageToFlowNode(record.node)
    : classToFlowNode(record.node);
}

/**
 * 共有レコードから React Flow ノードを作りつつ、前ノードの「ローカル固有の状態」を引き継ぐ。
 *
 * xyflow は計測サイズ（`measured`）が無いノードを非表示にするため、リモート更新の
 * たびにノードを作り直すと、移動中の相手ノードが未計測扱いで消えてしまう。
 * `measured` と選択・ドラッグ状態は前ノードから引き継ぎ、データ・座標だけ更新する。
 */
export function hydrateFlowNode(
  prev: AppFlowNode | undefined,
  record: YNodeRecord
): AppFlowNode {
  const fresh = recordToFlowNode(record);
  if (prev) {
    fresh.measured = prev.measured;
    fresh.selected = prev.selected;
    fresh.dragging = prev.dragging;
  }
  return fresh;
}

/** React Flow エッジ → 共有レコード。 */
export function flowEdgeToRecord(edge: UmlFlowEdge): YEdgeRecord {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    kind: edge.data?.kind ?? "association",
    label: edge.data?.label,
    sourceHandle: edge.sourceHandle ?? undefined,
    targetHandle: edge.targetHandle ?? undefined,
  };
}

/** 共有レコード → React Flow エッジ。 */
export function recordToFlowEdge(record: YEdgeRecord): UmlFlowEdge {
  return diagramEdgeToFlowEdge(record);
}

/**
 * 描画順を整える: パッケージ（背面）を先頭、クラス（前面）を後ろに並べる。
 * Y.Map の並び順に依存せず z 順を保つため、常にこの順で組み直す。
 */
export function sortByLayer(nodes: AppFlowNode[]): AppFlowNode[] {
  const packages = nodes.filter(isPackageNode);
  const classes = nodes.filter((node) => !isPackageNode(node));
  return [...packages, ...classes];
}

/** レコードが実質同一かを判定する（無駄な共有書き込みを避けるため）。 */
export function recordsEqual(
  a: YNodeRecord | YEdgeRecord | undefined,
  b: YNodeRecord | YEdgeRecord
): boolean {
  return a !== undefined && JSON.stringify(a) === JSON.stringify(b);
}
