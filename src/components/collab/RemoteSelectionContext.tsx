"use client";

/**
 * 「他ユーザーが選択中の要素」を各ノードへ配るための Context。
 *
 * 要素 id → その要素を選択しているユーザー一覧、というマップを供給する。
 * カスタムノードはこの Context を購読し、自分が誰かに選択されていれば
 * その色の枠と名前ラベルを描く。ローカル単独モードでは Provider を置かないため
 * 常に空となり、追加描画は行われない。
 */

import { createContext, useContext, type ReactNode } from "react";
import type { RemotePresence } from "@/lib/collab/useCollaborativeDiagram";

/** 要素 id → 選択中ユーザー一覧。 */
type RemoteSelectionMap = Map<string, RemotePresence[]>;

const RemoteSelectionContext = createContext<RemoteSelectionMap>(new Map());

export function RemoteSelectionProvider({
  value,
  children,
}: {
  value: RemoteSelectionMap;
  children: ReactNode;
}) {
  return (
    <RemoteSelectionContext.Provider value={value}>
      {children}
    </RemoteSelectionContext.Provider>
  );
}

/** 指定要素を選択中の他ユーザーを返す（いなければ空配列）。 */
export function useRemoteSelectors(id: string): RemotePresence[] {
  return useContext(RemoteSelectionContext).get(id) ?? [];
}
