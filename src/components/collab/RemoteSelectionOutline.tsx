"use client";

/**
 * 他ユーザーが選択中のノードに重ねる色枠＋名前ラベル。
 * ノード本体（position: relative）の内側に絶対配置で置く前提。
 * 選択者がいなければ何も描かない（ローカルモードでは常にそうなる）。
 */

import { useRemoteSelectors } from "./RemoteSelectionContext";

export function RemoteSelectionOutline({ nodeId }: { nodeId: string }) {
  const selectors = useRemoteSelectors(nodeId);
  if (selectors.length === 0) return null;

  // 枠は先頭ユーザーの色。ラベルは選択者全員ぶん並べる。
  const primaryColor = selectors[0].user.color;

  return (
    <div
      className="pointer-events-none absolute -inset-0.5 rounded-sm"
      style={{ boxShadow: `0 0 0 2px ${primaryColor}` }}
    >
      <div className="absolute -top-5 left-0 flex gap-1">
        {selectors.map((peer) => (
          <span
            key={peer.clientId}
            className="whitespace-nowrap rounded px-1 text-[10px] font-medium leading-4 text-white"
            style={{ backgroundColor: peer.user.color }}
          >
            {peer.user.name}
          </span>
        ))}
      </div>
    </div>
  );
}
