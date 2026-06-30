/**
 * 永続データ（Diagram）⇄ React Flow 表現の変換。
 *
 * データモデルの設計メモ通り、永続構造と React Flow の `nodes` / `edges` は
 * 別概念として持ち、ここで双方向に変換する。Phase 1 ではクラス → ノードの
 * 一方向（描画用）のみを実装する。エッジ変換は後続フェーズで追加する。
 */

import type { ClassNode as ClassNodeData, Diagram } from "@/types/diagram";
import type { ClassFlowNode } from "@/components/nodes/ClassNode";

/** 1 件のクラスを React Flow のカスタムノードへ変換する。 */
function toFlowNode(classNode: ClassNodeData): ClassFlowNode {
  return {
    id: classNode.id,
    type: "umlClass",
    position: classNode.position,
    data: { classNode },
  };
}

/** Diagram のクラス配列を React Flow ノード配列へ変換する。 */
export function classesToFlowNodes(diagram: Diagram): ClassFlowNode[] {
  return diagram.classes.map(toFlowNode);
}
