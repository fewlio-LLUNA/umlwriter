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
} from "@/types/diagram";
import type { ClassFlowNode } from "@/components/nodes/ClassNode";
import type { UmlFlowEdge } from "@/components/edges/UmlEdge";
import { SCHEMA_VERSION } from "@/lib/storage";

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
 * ドラッグで動いた座標は `node.position` が最新なので、そちらを正とする。
 * Note はまだ扱わないため空配列でルートを組む。
 */
export function flowToDiagram(
  nodes: ClassFlowNode[],
  edges: UmlFlowEdge[]
): Diagram {
  return {
    schemaVersion: SCHEMA_VERSION,
    classes: nodes.map((node) => ({
      ...node.data.classNode,
      position: node.position,
    })),
    edges: edges.map(flowEdgeToDiagramEdge),
    notes: [],
  };
}
