"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

import type { ClassNode as ClassNodeData } from "@/types/diagram";
import {
  formatAttribute,
  formatOperation,
  stereotypeLabel,
} from "@/lib/umlFormat";

/**
 * React Flow のカスタムノード型。`data` に永続データの ClassNode をそのまま載せる。
 * `type: "umlClass"` で DiagramCanvas の nodeTypes に対応づける。
 */
export type ClassFlowNode = Node<{ classNode: ClassNodeData }, "umlClass">;

/**
 * UML クラスの箱（カスタムノード）。
 *
 * UML 標準の 3 段組で描く:
 *   1. ステレオタイプ（任意） + クラス名
 *   2. 属性
 *   3. 操作
 *
 * 書体ルール（abstract 斜体・static 下線・interface のギュメ表示）は
 * `uml-class-diagram-tool/uml-notation/` のナレッジに準拠する。
 * 関連線・Handle・編集 UI は後続フェーズで追加する（Phase 1 は表示のみ）。
 */
function ClassNodeComponent({ data, selected }: NodeProps<ClassFlowNode>) {
  const { classNode } = data;
  const label = stereotypeLabel(classNode.stereotype);
  // abstract は UML 慣習でクラス名を斜体にする。
  const isNameItalic = classNode.stereotype === "abstract";

  return (
    <div
      className={`min-w-[180px] rounded-sm border bg-white text-slate-900 shadow-sm ${
        // 選択中は枠を強調してインスペクタとの対応を分かりやすくする。
        selected ? "border-blue-500 ring-2 ring-blue-300" : "border-slate-700"
      }`}
    >
      {/* 関連線の接続点。4 辺に置き、ConnectionMode.Loose で source/target 兼用にする。 */}
      <ConnectionHandles />

      {/* 1 段目: ステレオタイプ + クラス名 */}
      <div className="border-b border-slate-700 px-3 py-1.5 text-center">
        {label && (
          <div className="text-xs leading-tight text-slate-500">{label}</div>
        )}
        <div
          className={`font-bold leading-tight ${isNameItalic ? "italic" : ""}`}
        >
          {classNode.name}
        </div>
      </div>

      {/* 2 段目: 属性 */}
      <MemberSection emptyHint="（属性なし）">
        {classNode.attributes.map((attribute) => (
          <li
            key={attribute.id}
            className={attribute.isStatic ? "underline" : undefined}
          >
            {formatAttribute(attribute)}
          </li>
        ))}
      </MemberSection>

      {/* 3 段目: 操作 */}
      <MemberSection emptyHint="（操作なし）" divider>
        {classNode.operations.map((operation) => (
          <li
            key={operation.id}
            className={[
              operation.isStatic ? "underline" : "",
              operation.isAbstract ? "italic" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {formatOperation(operation)}
          </li>
        ))}
      </MemberSection>
    </div>
  );
}

/**
 * 属性 / 操作の段を描く共通枠。
 * メンバが無い段はヒント文をうっすら出して、空段でも箱の構造が分かるようにする。
 */
function MemberSection({
  children,
  emptyHint,
  divider = false,
}: {
  children: React.ReactNode[];
  emptyHint: string;
  /** 上に区切り線を引くか（操作段で使う） */
  divider?: boolean;
}) {
  const isEmpty = children.length === 0;
  return (
    <div
      className={`px-3 py-1.5 font-mono text-xs leading-relaxed ${
        divider ? "border-t border-slate-700" : ""
      }`}
    >
      {isEmpty ? (
        <span className="italic text-slate-400">{emptyHint}</span>
      ) : (
        <ul className="space-y-0.5">{children}</ul>
      )}
    </div>
  );
}

/** 接続点の定義（4 辺）。id を sourceHandle / targetHandle として保存・復元する。 */
const HANDLES: { id: string; position: Position }[] = [
  { id: "top", position: Position.Top },
  { id: "right", position: Position.Right },
  { id: "bottom", position: Position.Bottom },
  { id: "left", position: Position.Left },
];

/**
 * 4 辺の接続ハンドル。ConnectionMode.Loose 前提で type="source" のみ置き、
 * どの辺からどの辺へでも線を引けるようにする。
 */
function ConnectionHandles() {
  return (
    <>
      {HANDLES.map(({ id, position }) => (
        <Handle
          key={id}
          id={id}
          type="source"
          position={position}
          className="!h-2 !w-2 !border !border-slate-400 !bg-white"
        />
      ))}
    </>
  );
}

// 親（DiagramCanvas）の再描画でノード本体が無駄に作り直されないよう memo 化する。
export const ClassNode = memo(ClassNodeComponent);
