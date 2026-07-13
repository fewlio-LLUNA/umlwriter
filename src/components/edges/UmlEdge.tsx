"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type Edge as FlowEdge,
  type EdgeProps,
} from "@xyflow/react";

import type { RelationKind } from "@/types/diagram";
import { edgeStyleOf } from "./markerConfig";
import { useRemoteSelectors } from "@/components/collab/RemoteSelectionContext";

/** カスタムエッジが React Flow 上で持つデータ。 */
export interface UmlEdgeData {
  kind: RelationKind;
  label?: string;
  [key: string]: unknown;
}

/** React Flow のエッジ型（`type: "uml"`）。 */
export type UmlFlowEdge = FlowEdge<UmlEdgeData, "uml">;

/**
 * UML 関連線のカスタムエッジ。
 *
 * `data.kind` を見て線種（実線/破線）と終端記号を切り替える。マーカーは
 * MarkerDefs の SVG marker を参照するため、ここでは ID 文字列を渡すだけ。
 * 接続点はノード移動に追従する（React Flow が座標を再計算する）。
 */
function UmlEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<UmlFlowEdge>) {
  const kind = data?.kind ?? "association";
  const style = edgeStyleOf(kind);
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // 共同編集: 他ユーザーが選択中ならその色でハロー＋名前を出す。
  const remoteSelectors = useRemoteSelectors(id);
  const remoteColor = remoteSelectors[0]?.user.color;

  return (
    <>
      {/* 他ユーザー選択時の色ハロー（本線の背面に太めで敷く） */}
      {remoteColor && (
        <path
          d={path}
          fill="none"
          stroke={remoteColor}
          strokeWidth={6}
          strokeOpacity={0.35}
          strokeLinecap="round"
        />
      )}
      <BaseEdge
        path={path}
        markerStart={style.markerStart}
        markerEnd={style.markerEnd}
        style={{
          stroke: selected ? "#3b82f6" : "#334155",
          strokeWidth: selected ? 2 : 1.5,
          strokeDasharray: style.dashed ? "6 4" : undefined,
        }}
      />
      {remoteSelectors.length > 0 && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute flex gap-1"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY - 16}px)`,
            }}
          >
            {remoteSelectors.map((peer) => (
              <span
                key={peer.clientId}
                className="whitespace-nowrap rounded px-1 text-[10px] font-medium leading-4 text-white"
                style={{ backgroundColor: peer.user.color }}
              >
                {peer.user.name}
              </span>
            ))}
          </div>
        </EdgeLabelRenderer>
      )}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none absolute rounded bg-white/90 px-1 text-xs text-slate-600"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export const UmlEdge = memo(UmlEdgeComponent);
