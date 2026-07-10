/**
 * 永続データ（Diagram）⇄ React Flow 表現の双方向変換。
 *
 * データモデルの設計メモ通り、永続構造と React Flow の `nodes` / `edges` は
 * 別概念として持ち、ここで相互に変換する。編集中の生きた状態を React Flow の
 * ノード / エッジで持ち、保存時に Diagram へシリアライズする。
 */

import type {
  ClassNode as ClassNodeData,
  Diagram,
  Edge as DiagramEdge,
  PackageNode as PackageNodeData,
} from "@/types/diagram";
import type { ClassFlowNode } from "@/components/nodes/ClassNode";
import type { PackageFlowNode } from "@/components/nodes/PackageNode";
import type { UmlFlowEdge } from "@/components/edges/UmlEdge";
import { SCHEMA_VERSION } from "@/lib/storage";

/** キャンバス上のノード（クラス or パッケージ）のユニオン。 */
export type AppFlowNode = ClassFlowNode | PackageFlowNode;

/** ノードがパッケージかを判定する型ガード。 */
export function isPackageNode(node: AppFlowNode): node is PackageFlowNode {
  return node.type === "umlPackage";
}

/** 1 件のクラスを React Flow のカスタムノードへ変換する。 */
export function classToFlowNode(classNode: ClassNodeData): ClassFlowNode {
  return {
    id: classNode.id,
    type: "umlClass",
    position: classNode.position,
    data: { classNode },
  };
}

/** Diagram のクラス配列を React Flow ノード配列へ変換する。 */
export function classesToFlowNodes(diagram: Diagram): ClassFlowNode[] {
  return diagram.classes.map(classToFlowNode);
}

/** 1 件のパッケージを React Flow のカスタムノードへ変換する。 */
export function packageToFlowNode(pkg: PackageNodeData): PackageFlowNode {
  return {
    id: pkg.id,
    type: "umlPackage",
    position: pkg.position,
    width: pkg.width,
    height: pkg.height,
    data: { packageNode: pkg },
  };
}

/** Diagram のパッケージ配列を React Flow ノード配列へ変換する。 */
export function packagesToFlowNodes(diagram: Diagram): PackageFlowNode[] {
  return diagram.packages.map(packageToFlowNode);
}

/** 1 件の関連を React Flow のカスタムエッジへ変換する。 */
export function diagramEdgeToFlowEdge(edge: DiagramEdge): UmlFlowEdge {
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle,
    type: "uml",
    data: { kind: edge.kind, label: edge.label },
  };
}

/** Diagram の関連配列を React Flow エッジ配列へ変換する。 */
export function edgesToFlowEdges(diagram: Diagram): UmlFlowEdge[] {
  return diagram.edges.map(diagramEdgeToFlowEdge);
}

/** React Flow エッジを永続用の関連へ戻す。 */
function flowEdgeToDiagramEdge(edge: UmlFlowEdge): DiagramEdge {
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

/**
 * React Flow のノード / エッジを Diagram へ戻す（保存用シリアライズ）。
 * ドラッグで動いた座標は `node.position`、リサイズ後のサイズは `node.width/height`
 * が最新なので、そちらを正とする。Note はまだ扱わないため空配列でルートを組む。
 */
export function flowToDiagram(
  nodes: AppFlowNode[],
  edges: UmlFlowEdge[]
): Diagram {
  const classes: ClassNodeData[] = [];
  const packages: PackageNodeData[] = [];
  for (const node of nodes) {
    if (isPackageNode(node)) {
      packages.push({
        ...node.data.packageNode,
        position: node.position,
        width: node.width ?? node.data.packageNode.width,
        height: node.height ?? node.data.packageNode.height,
      });
    } else {
      classes.push({ ...node.data.classNode, position: node.position });
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    classes,
    edges: edges.map(flowEdgeToDiagramEdge),
    packages,
    notes: [],
  };
}
