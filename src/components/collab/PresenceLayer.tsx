"use client";

/**
 * 共同編集中の「他人のカーソル」を重ね描きするレイヤ。
 *
 * ReactFlow の子として描画し、ビューポート変換（パン / ズーム）を購読して
 * フロー座標のカーソルを画面座標へ変換する。相手の名前ラベルも添える。
 */

import { useStore } from "@xyflow/react";
import type { RemotePresence } from "@/lib/collab/useCollaborativeDiagram";

export function PresenceLayer({ remote }: { remote: RemotePresence[] }) {
  // [平行移動x, 平行移動y, ズーム]。パン / ズームに追従させる。
  const [tx, ty, zoom] = useStore((state) => state.transform);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {remote.map((peer) => {
        if (!peer.cursor) return null;
        const left = peer.cursor.x * zoom + tx;
        const top = peer.cursor.y * zoom + ty;
        return (
          <div
            key={peer.clientId}
            className="absolute"
            style={{ left, top, transform: "translate(-2px, -2px)" }}
          >
            {/* カーソル矢印 */}
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M2 2 L2 14 L6 10 L9 16 L11 15 L8 9 L14 9 Z"
                fill={peer.user.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            {/* 名前ラベル */}
            <span
              className="ml-3 -mt-1 inline-block whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium text-white shadow"
              style={{ backgroundColor: peer.user.color }}
            >
              {peer.user.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
