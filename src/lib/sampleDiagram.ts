/**
 * Phase 1 の表示確認用サンプル Diagram。
 *
 * まだクラス追加 / 編集 UI が無いため、カスタムノードの 3 段組描画
 * （ステレオタイプ・可視性・static 下線・abstract 斜体）を目視確認する
 * ための仮データ。Phase 2 以降で実データ（状態管理 / localStorage）に
 * 置き換える前提の、捨てやすい定義として切り出しておく。
 */

import type { Diagram } from "@/types/diagram";

export const sampleDiagram: Diagram = {
  schemaVersion: "1.0",
  classes: [
    {
      id: "book",
      name: "Book",
      stereotype: "none",
      position: { x: 80, y: 80 },
      attributes: [
        { id: "book-title", visibility: "-", name: "title", type: "String" },
        { id: "book-price", visibility: "+", name: "price", type: "Number" },
        {
          id: "book-count",
          visibility: "+",
          name: "count",
          type: "Number",
          isStatic: true,
        },
      ],
      operations: [
        {
          id: "book-find",
          visibility: "+",
          name: "findById",
          parameters: [{ name: "id", type: "String" }],
          returnType: "Book",
        },
      ],
    },
    {
      id: "repository",
      name: "Repository",
      stereotype: "interface",
      position: { x: 360, y: 80 },
      attributes: [],
      operations: [
        {
          id: "repo-save",
          visibility: "+",
          name: "save",
          parameters: [{ name: "entity", type: "T" }],
          returnType: "void",
          isAbstract: true,
        },
      ],
    },
    {
      id: "shape",
      name: "Shape",
      stereotype: "abstract",
      position: { x: 360, y: 280 },
      attributes: [
        { id: "shape-color", visibility: "#", name: "color", type: "String" },
      ],
      operations: [
        {
          id: "shape-area",
          visibility: "+",
          name: "area",
          parameters: [],
          returnType: "Number",
          isAbstract: true,
        },
      ],
    },
  ],
  edges: [],
  notes: [],
};
