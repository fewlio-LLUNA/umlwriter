"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useNodesState,
  type OnSelectionChangeFunc,
} from "@xyflow/react";

import type { ClassNode } from "@/types/diagram";
import type { ClassFlowNode } from "@/components/nodes/ClassNode";
import { DiagramCanvas } from "@/components/DiagramCanvas";
import { Toolbar } from "@/components/Toolbar";
import { Inspector } from "@/components/Inspector";
import {
  classesToFlowNodes,
  classToFlowNode,
  flowNodesToDiagram,
} from "@/lib/diagramToFlow";
import { createEmptyClass } from "@/lib/createClass";
import { loadDiagram, saveDiagram } from "@/lib/storage";

/** 新規クラスを少しずつずらして置くための基準オフセット。 */
const CASCADE_STEP = 36;
const CASCADE_ORIGIN = 80;

/**
 * 図エディタの最上位コンテナ（Phase 2）。
 *
 * 3 ペイン（Toolbar / Canvas / Inspector）を束ね、ノードの状態と選択を一元管理する。
 * 生きた状態は React Flow ノードで持ち、変更のたびに Diagram へシリアライズして
 * localStorage に自動保存する。リロード時は保存データから復元する。
 */
export function DiagramEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ClassFlowNode>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 復元完了までは保存しない（初期の空状態で保存データを上書きしないため）。
  const hydrated = useRef(false);

  // 初回マウント時に localStorage から復元する（SSR を避けてクライアントで実行）。
  useEffect(() => {
    const saved = loadDiagram();
    if (saved) {
      setNodes(classesToFlowNodes(saved));
    }
    hydrated.current = true;
  }, [setNodes]);

  // ノードが変わるたびに Diagram へ変換して自動保存する。
  useEffect(() => {
    if (!hydrated.current) return;
    saveDiagram(flowNodesToDiagram(nodes));
  }, [nodes]);

  // 「クラス追加」: 既存数に応じて少しずらした位置へ新規クラスを置く。
  const handleAddClass = useCallback(() => {
    setNodes((current) => {
      const offset = CASCADE_ORIGIN + (current.length % 8) * CASCADE_STEP;
      const newClass = createEmptyClass({ x: offset, y: offset });
      return [...current, classToFlowNode(newClass)];
    });
  }, [setNodes]);

  // 選択変更: 先頭の選択ノードをインスペクタ対象にする（未選択なら null）。
  const handleSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes: selectedNodes }) => {
      setSelectedId(selectedNodes[0]?.id ?? null);
    },
    []
  );

  // インスペクタからのクラス編集を該当ノードへ反映する（即時反映 → 自動保存）。
  const updateClass = useCallback(
    (id: string, updater: (classNode: ClassNode) => ClassNode) => {
      setNodes((current) =>
        current.map((node) =>
          node.id === id
            ? { ...node, data: { classNode: updater(node.data.classNode) } }
            : node
        )
      );
    },
    [setNodes]
  );

  // インスペクタの削除ボタンからクラスを削除する。
  const removeClass = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((node) => node.id !== id));
      setSelectedId((prev) => (prev === id ? null : prev));
    },
    [setNodes]
  );

  // 選択中クラスの最新データをノードから引く（削除済みなら null）。
  const selectedClass =
    nodes.find((node) => node.id === selectedId)?.data.classNode ?? null;

  return (
    <div className="flex h-full w-full flex-col">
      <Toolbar onAddClass={handleAddClass} />
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <DiagramCanvas
            nodes={nodes}
            onNodesChange={onNodesChange}
            onSelectionChange={handleSelectionChange}
          />
        </div>
        <Inspector
          selected={selectedClass}
          onUpdate={updateClass}
          onRemove={removeClass}
        />
      </div>
    </div>
  );
}
