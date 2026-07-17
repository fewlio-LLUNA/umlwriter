import { describe, expect, it } from "vitest";

import { createNameRegistry } from "@/lib/mermaid/identifiers";
import { buildRelationLine } from "@/lib/mermaid/relations";
import { makeClass, makeEdge } from "@/lib/mermaid/testFixtures";

/** c1=Library / c2=Book の 2 クラスを持つ registry。 */
const registry = createNameRegistry([
  makeClass({ id: "c1", name: "Library" }),
  makeClass({ id: "c2", name: "Book" }),
]);

describe("buildRelationLine（向きを変えない4種）", () => {
  it("association は source --> target", () => {
    expect(buildRelationLine(makeEdge({ kind: "association" }), registry)).toBe(
      "Library --> Book"
    );
  });

  it("aggregation は全体（source）側に白ダイヤ", () => {
    expect(buildRelationLine(makeEdge({ kind: "aggregation" }), registry)).toBe(
      "Library o-- Book"
    );
  });

  it("composition は全体（source）側に塗りダイヤ", () => {
    expect(buildRelationLine(makeEdge({ kind: "composition" }), registry)).toBe(
      "Library *-- Book"
    );
  });

  it("dependency は source ..> target", () => {
    expect(buildRelationLine(makeEdge({ kind: "dependency" }), registry)).toBe(
      "Library ..> Book"
    );
  });
});

describe("buildRelationLine（左右が入れ替わる2種）", () => {
  // このアプリは target=親。Mermaid は記号が左側に付くので親を左に置く。
  it("generalization は親（target）を左に置く", () => {
    expect(
      buildRelationLine(
        makeEdge({ kind: "generalization", source: "c2", target: "c1" }),
        registry
      )
    ).toBe("Library <|-- Book");
  });

  it("realization は interface（target）を左に置く", () => {
    expect(
      buildRelationLine(
        makeEdge({ kind: "realization", source: "c2", target: "c1" }),
        registry
      )
    ).toBe("Library <|.. Book");
  });

  it("入れ替えるときは多重度も一緒に入れ替える", () => {
    expect(
      buildRelationLine(
        makeEdge({
          kind: "generalization",
          source: "c2",
          target: "c1",
          sourceMultiplicity: "*",
          targetMultiplicity: "1",
        }),
        registry
      )
    ).toBe('Library "1" <|-- "*" Book');
  });
});

describe("buildRelationLine（多重度・ラベル）", () => {
  it("多重度とラベルを両方出す", () => {
    expect(
      buildRelationLine(
        makeEdge({
          kind: "aggregation",
          sourceMultiplicity: "1",
          targetMultiplicity: "*",
          label: "蔵書",
        }),
        registry
      )
    ).toBe('Library "1" o-- "*" Book : 蔵書');
  });

  it("片側だけの多重度も出せる", () => {
    expect(
      buildRelationLine(makeEdge({ targetMultiplicity: "0..1" }), registry)
    ).toBe('Library --> "0..1" Book');
  });

  it("空文字や空白だけの多重度・ラベルは省く", () => {
    expect(
      buildRelationLine(
        makeEdge({ sourceMultiplicity: "", targetMultiplicity: "  ", label: " " }),
        registry
      )
    ).toBe("Library --> Book");
  });
});

describe("buildRelationLine（壊れたデータ）", () => {
  it("解決できないクラスを指すエッジは null を返す（例外を投げない）", () => {
    expect(buildRelationLine(makeEdge({ source: "存在しない" }), registry)).toBeNull();
    expect(buildRelationLine(makeEdge({ target: "存在しない" }), registry)).toBeNull();
  });
});
