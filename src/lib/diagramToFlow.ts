/**
 * 永続データ（Diagram）⇄ React Flow 表現の双方向変換。
 *
 * データモデルの設計メモ通り、永続構造と React Flow の `nodes` / `edges` は
 * 別概念として持ち、ここで相互に変換する。Phase 2 では編集中の生きた状態を
 * React Flow ノードで持ち、保存時に Diagram へシリアライズする
 * （クラス → ノード / ノード → クラスの両方向）。エッジ変換は後続フェーズ。
 */

import type { ClassNode as ClassNodeData, Diagram } from "@/types/diagram";
import type { ClassFlowNode } from "@/components/nodes/ClassNode";
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

/**
 * React Flow ノード配列を Diagram へ戻す（保存用シリアライズ）。
 * ドラッグで動いた座標は `node.position` が最新なので、そちらを正とする。
 * Edge / Note はまだ扱わないため空配列でルートを組む。
 */
export function flowNodesToDiagram(nodes: ClassFlowNode[]): Diagram {
  return {
    schemaVersion: SCHEMA_VERSION,
    classes: nodes.map((node) => ({
      ...node.data.classNode,
      position: node.position,
    })),
    edges: [],
    notes: [],
  };
}
