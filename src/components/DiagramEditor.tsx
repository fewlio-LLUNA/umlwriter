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

import type { ClassNode, Diagram, PackageNode } from "@/types/diagram";
import type { UmlEdgeData, UmlFlowEdge } from "@/components/edges/UmlEdge";
import { DiagramCanvas } from "@/components/DiagramCanvas";
import { Toolbar } from "@/components/Toolbar";
import { Inspector } from "@/components/Inspector";
import {
  classesToFlowNodes,
  classToFlowNode,
  edgesToFlowEdges,
  flowToDiagram,
  isPackageNode,
  packagesToFlowNodes,
  packageToFlowNode,
  type AppFlowNode,
} from "@/lib/diagramToFlow";
import { createEmptyClass } from "@/lib/createClass";
import { createEmptyPackage } from "@/lib/createPackage";
import {
  loadDiagram,
  saveDiagram,
  loadViewPrefs,
  saveViewPrefs,
} from "@/lib/storage";
import { exportDiagramJson } from "@/lib/jsonIo";
import {
  DEFAULT_DISPLAY_PREFS,
  DisplayPrefsProvider,
  type DisplayPrefs,
} from "@/components/DisplayPrefsContext";

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
  const [nodes, setNodes, onNodesChange] = useNodesState<AppFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<UmlFlowEdge>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [displayPrefs, setDisplayPrefs] = useState<DisplayPrefs>(
    DEFAULT_DISPLAY_PREFS
  );
  // 復元完了までは保存しない（初期の空状態で保存データを上書きしないため）。
  const hydrated = useRef(false);

  // 初回マウント時に localStorage から復元する（SSR を避けてクライアントで実行）。
  useEffect(() => {
    const saved = loadDiagram();
    if (saved) {
      // パッケージを先頭に置き、クラスより背面に描画する。
      setNodes([...packagesToFlowNodes(saved), ...classesToFlowNodes(saved)]);
      setEdges(edgesToFlowEdges(saved));
    }
    // localStorage は SSR で読めないため、マウント後に反映する（ハイドレーション回避）。
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplayPrefs(loadViewPrefs());
    hydrated.current = true;
  }, [setNodes, setEdges]);

  // ノード / エッジが変わるたびに Diagram へ変換して自動保存する。
  useEffect(() => {
    if (!hydrated.current) return;
    saveDiagram(flowToDiagram(nodes, edges));
  }, [nodes, edges]);

  // 表示オプションが変わるたびに保存する。
  useEffect(() => {
    if (!hydrated.current) return;
    saveViewPrefs(displayPrefs);
  }, [displayPrefs]);

  // 「クラス追加」: 既存数に応じて少しずらした位置へ新規クラスを置く。
  const handleAddClass = useCallback(() => {
    setNodes((current) => {
      const offset = CASCADE_ORIGIN + (current.length % 8) * CASCADE_STEP;
      const newClass = createEmptyClass({ x: offset, y: offset });
      return [...current, classToFlowNode(newClass)];
    });
  }, [setNodes]);

  // 「パッケージ追加」: 先頭に差し込み、クラスより背面に置く。
  const handleAddPackage = useCallback(() => {
    setNodes((current) => {
      const offset = CASCADE_ORIGIN + (current.length % 8) * CASCADE_STEP;
      const newPackage = createEmptyPackage({ x: offset, y: offset });
      return [packageToFlowNode(newPackage), ...current];
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
        current.map((node) => {
          if (node.id !== id || isPackageNode(node)) return node;
          return { ...node, data: { classNode: updater(node.data.classNode) } };
        })
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

  // インスペクタからのパッケージ名編集を反映する。
  const updatePackage = useCallback(
    (id: string, changes: Partial<PackageNode>) => {
      setNodes((current) =>
        current.map((node) => {
          if (node.id !== id || !isPackageNode(node)) return node;
          return {
            ...node,
            data: { packageNode: { ...node.data.packageNode, ...changes } },
          };
        })
      );
    },
    [setNodes]
  );

  // パッケージ削除（見た目の枠のみ。関連線には影響しない）。
  const removePackage = useCallback(
    (id: string) => {
      setNodes((current) => current.filter((node) => node.id !== id));
      setSelectedNodeId((prev) => (prev === id ? null : prev));
    },
    [setNodes]
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
      // パッケージを先頭（背面）に置いてから読み込む。
      setNodes([
        ...packagesToFlowNodes(diagram),
        ...classesToFlowNodes(diagram),
      ]);
      setEdges(edgesToFlowEdges(diagram));
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    },
    [setNodes, setEdges]
  );

  // 表示オプションのトグル（static 下線 / abstract 斜体）。
  const toggleDisplayPref = useCallback((key: keyof DisplayPrefs) => {
    setDisplayPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // 選択中の要素を最新状態から引く（削除済みなら null）。
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedClass =
    selectedNode && !isPackageNode(selectedNode)
      ? selectedNode.data.classNode
      : null;
  const selectedPackage =
    selectedNode && isPackageNode(selectedNode)
      ? selectedNode.data.packageNode
      : null;
  const selectedEdgeFlow = edges.find((edge) => edge.id === selectedEdgeId);
  const nameOf = (id: string) => {
    // 関連線はクラス同士のみ接続するため、対象はクラスノード。
    const node = nodes.find((n) => n.id === id);
    return node && !isPackageNode(node) ? node.data.classNode.name : undefined;
  };
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
    // 表示オプションは Context でカスタムノードへ配る。
    <ReactFlowProvider>
      <DisplayPrefsProvider value={displayPrefs}>
        <div className="flex h-full w-full flex-col">
          <Toolbar
            onAddClass={handleAddClass}
            onAddPackage={handleAddPackage}
            onExportJson={handleExportJson}
            onImportDiagram={handleImportDiagram}
            displayPrefs={displayPrefs}
            onToggleDisplayPref={toggleDisplayPref}
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
              selectedPackage={selectedPackage}
              onUpdateClass={updateClass}
              onRemoveClass={removeClass}
              onUpdateEdge={updateEdge}
              onSwapEdge={swapEdgeDirection}
              onRemoveEdge={removeEdge}
              onUpdatePackage={updatePackage}
              onRemovePackage={removePackage}
            />
          </div>
        </div>
      </DisplayPrefsProvider>
    </ReactFlowProvider>
  );
}
