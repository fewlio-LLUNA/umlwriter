/**
 * テスト用のダミーデータと共通ヘルパ。
 *
 * 各テストが必要な項目だけを上書きできるよう、既定値入りのファクトリを置く。
 */

import type {
  Attribute,
  ClassNode,
  Diagram,
  Edge,
  Operation,
  PackageNode,
} from "@/types/diagram";

export function makeAttribute(overrides: Partial<Attribute> = {}): Attribute {
  return { id: "a1", visibility: "-", name: "title", ...overrides };
}

export function makeOperation(overrides: Partial<Operation> = {}): Operation {
  return { id: "o1", visibility: "+", name: "run", parameters: [], ...overrides };
}

export function makeClass(overrides: Partial<ClassNode> = {}): ClassNode {
  return {
    id: "c1",
    name: "Book",
    stereotype: "none",
    attributes: [],
    operations: [],
    position: { x: 0, y: 0 },
    ...overrides,
  };
}

export function makeEdge(overrides: Partial<Edge> = {}): Edge {
  return { id: "e1", source: "c1", target: "c2", kind: "association", ...overrides };
}

export function makePackage(overrides: Partial<PackageNode> = {}): PackageNode {
  return {
    id: "p1",
    name: "貸出",
    position: { x: 0, y: 0 },
    width: 320,
    height: 200,
    ...overrides,
  };
}

export function makeDiagram(overrides: Partial<Diagram> = {}): Diagram {
  return {
    schemaVersion: "1.0",
    classes: [],
    edges: [],
    packages: [],
    notes: [],
    ...overrides,
  };
}
