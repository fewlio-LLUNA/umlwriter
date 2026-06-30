"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type OnSelectionChangeFunc,
} from "@xyflow/react";

import type { ClassNode, Diagram } from "@/types/diagram";
import type { ClassFlowNode } from "@/components/nodes/ClassNode";
import type { UmlEdgeData, UmlFlowEdge } from "@/components/edges/UmlEdge";
import { DiagramCanvas } from "@/components/DiagramCanvas";
import { Toolbar } from "@/components/Toolbar";
import { Inspector } from "@/components/Inspector";
import {
  classesToFlowNodes,
  classToFlowNode,
  edgesToFlowEdges,
  flowToDiagram,
} from "@/lib/diagramToFlow";
import { createEmptyClass } from "@/lib/createClass";
import { loadDiagram, saveDiagram } from "@/lib/storage";
import { exportDiagramJson } from "@/lib/jsonIo";

/** 新規クラスを少しずつずらして置くための基準オフセット。 */
const CASCADE_STEP = 36;
const CASCADE_ORIGIN = 80;

/**
 * 図エディタの最上位コンテナ（Phase 4）。
 *
 * 3 ペイン（Toolbar / Canvas / Inspector）を束ね、ノード / エッジの状態と選択を
 * 一元管理する。生きた状態は React Flow のノード / エッジで持ち、変更のたびに
 * Diagram へシリアライズして localStorage に自動保存する。リロード時は復元する。
 */
export function DiagramEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ClassFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<UmlFlowEdge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  // 復元完了までは保存しない（初期の空状態で保存データを上書きしないため）。
  const hydrated = useRef(false);

  // 初回マウント時に localStorage から復元する（SSR を避けてクライアントで実行）。
  useEffect(() => {
    const saved = loadDiagram();
    if (saved) {
      setNodes(classesToFlowNodes(saved));
      setEdges(edgesToFlowEdges(saved));
    }
    hydrated.current = true;
  }, [setNodes, setEdges]);

  // ノード / エッジが変わるたびに Diagram へ変換して自動保存する。
  useEffect(() => {
    if (!hydrated.current) return;
    saveDiagram(flowToDiagram(nodes, edges));
  }, [nodes, edges]);

  // 「クラス追加」: 既存数に応じて少しずらした位置へ新規クラスを置く。
  const handleAddClass = useCallback(() => {
    setNodes((current) => {
      const offset = CASCADE_ORIGIN + (current.length % 8) * CASCADE_STEP;
      const newClass = createEmptyClass({ x: offset, y: offset });
      return [...current, classToFlowNode(newClass)];
    });
  }, [setNodes]);

  // Handle 同士の接続で関連線を作る。既定の種類は association（種類は Inspector で変更）。
  const handleConnect = useCallback<OnConnect>(
    (connection) => {
      const newEdge: UmlFlowEdge = {
        id: crypto.randomUUID(),
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: "uml",
        data: { kind: "association" },
      };
      setEdges((current) => addEdge(newEdge, current));
    },
    [setEdges]
  );

  // 選択変更: 先頭の選択ノード / エッジをインスペクタ対象にする。
  const handleSelectionChange = useCallback<OnSelectionChangeFunc>(
    ({ nodes: selectedNodes, edges: selectedEdges }) => {
      setSelectedNodeId(selectedNodes[0]?.id ?? null);
      setSelectedEdgeId(selectedEdges[0]?.id ?? null);
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

  // クラス削除（接続している関連線も連動して取り除く）。
  const removeClass = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((node) => node.id !== id));
      setEdges((current) =>
        current.filter((edge) => edge.source !== id && edge.target !== id)
      );
      setSelectedNodeId((prev) => (prev === id ? null : prev));
    },
    [setNodes, setEdges]
  );

  // インスペクタからの関連編集（種類・関連名）を反映する。
  const updateEdge = useCallback(
    (id: string, changes: Partial<UmlEdgeData>) => {
      setEdges((current) =>
        current.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  ...changes,
                  kind: changes.kind ?? edge.data?.kind ?? "association",
                },
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  // 始点⇄終点を入れ替える（source/target と接続辺ハンドルをまとめて交換）。
  // 種類によってマーカーの付く側が決まるので、向きだけ後から直せるようにする。
  const swapEdgeDirection = useCallback(
    (id: string) => {
      setEdges((current) =>
        current.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                source: edge.target,
                target: edge.source,
                sourceHandle: edge.targetHandle,
                targetHandle: edge.sourceHandle,
              }
            : edge
        )
      );
    },
    [setEdges]
  );

  const removeEdge = useCallback(
    (id: string) => {
      setEdges((current) => current.filter((edge) => edge.id !== id));
      setSelectedEdgeId((prev) => (prev === id ? null : prev));
    },
    [setEdges]
  );

  // 現在の図を JSON で書き出す。
  const handleExportJson = useCallback(() => {
    exportDiagramJson(flowToDiagram(nodes, edges));
  }, [nodes, edges]);

  // 読み込んだ Diagram で現在の図を置き換える（自動保存に乗る）。
  const handleImportDiagram = useCallback(
    (diagram: Diagram) => {
      setNodes(classesToFlowNodes(diagram));
      setEdges(edgesToFlowEdges(diagram));
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    },
    [setNodes, setEdges]
  );

  // 選択中の要素を最新状態から引く（削除済みなら null）。
  const selectedClass =
    nodes.find((node) => node.id === selectedNodeId)?.data.classNode ?? null;
  const selectedEdgeFlow = edges.find((edge) => edge.id === selectedEdgeId);
  const nameOf = (id: string) =>
    nodes.find((node) => node.id === id)?.data.classNode.name;
  const selectedEdge = selectedEdgeFlow
    ? {
        id: selectedEdgeFlow.id,
        kind: selectedEdgeFlow.data?.kind ?? "association",
        label: selectedEdgeFlow.data?.label,
        sourceName: nameOf(selectedEdgeFlow.source),
        targetName: nameOf(selectedEdgeFlow.target),
      }
    : null;

  return (
    // Toolbar から useReactFlow（fitView）を使うため、全体を Provider で包む。
    <ReactFlowProvider>
      <div className="flex h-full w-full flex-col">
        <Toolbar
          onAddClass={handleAddClass}
          onExportJson={handleExportJson}
          onImportDiagram={handleImportDiagram}
        />
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1">
            <DiagramCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={handleConnect}
              onSelectionChange={handleSelectionChange}
            />
          </div>
          <Inspector
            selectedClass={selectedClass}
            selectedEdge={selectedEdge}
            onUpdateClass={updateClass}
            onRemoveClass={removeClass}
            onUpdateEdge={updateEdge}
            onSwapEdge={swapEdgeDirection}
            onRemoveEdge={removeEdge}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
