import mermaid from "mermaid";
import { beforeAll, describe, expect, it } from "vitest";

import { diagramToMermaid } from "@/lib/mermaid/document";
import {
  makeAttribute,
  makeClass,
  makeDiagram,
  makeEdge,
  makeOperation,
  makePackage,
} from "@/lib/mermaid/testFixtures";

/**
 * 出力が Mermaid の本物のパーサを通ることを確かめる。
 * 文字列比較だけだと「見た目は正しいが Mermaid が読めない」を取り逃すため。
 */
async function expectValidMermaid(text: string): Promise<void> {
  await expect(mermaid.parse(text)).resolves.toBeTruthy();
}

beforeAll(() => {
  mermaid.initialize({ startOnLoad: false });
});

describe("diagramToMermaid（構文の妥当性）", () => {
  it("クラス0件でも Mermaid が読める図を出す", async () => {
    // `classDiagram` だけだと Mermaid は構文エラーにするので詰め物が要る。
    const text = diagramToMermaid(makeDiagram());
    expect(text).toContain("note");
    await expectValidMermaid(text);
  });

  it("全部入りの図が Mermaid を通る", async () => {
    const diagram = makeDiagram({
      classes: [
        makeClass({
          id: "c1",
          name: "注文 (Order)",
          stereotype: "abstract",
          attributes: [
            makeAttribute({ name: "title", type: "String" }),
            makeAttribute({ id: "a2", name: "count", type: "int", isStatic: true }),
            makeAttribute({ id: "a3", name: "tags", type: "List<String>" }),
          ],
          operations: [
            makeOperation({
              name: "findById",
              parameters: [{ name: "id", type: "String" }],
              returnType: "Book",
            }),
            makeOperation({ id: "o2", name: "draw", isAbstract: true }),
            makeOperation({ id: "o3", name: "create", returnType: "Book", isStatic: true }),
          ],
          position: { x: 150, y: 150 },
        }),
        makeClass({ id: "c2", name: "図書館", position: { x: 900, y: 900 } }),
        makeClass({ id: "c3", name: "EBook", stereotype: "interface", position: { x: 160, y: 160 } }),
      ],
      packages: [makePackage({ id: "p1", name: "貸出 パッケージ" })],
      edges: [
        makeEdge({ id: "e1", source: "c2", target: "c1", kind: "aggregation", sourceMultiplicity: "1", targetMultiplicity: "*", label: "蔵書" }),
        makeEdge({ id: "e2", source: "c3", target: "c1", kind: "generalization" }),
        makeEdge({ id: "e3", source: "c1", target: "c3", kind: "realization" }),
        makeEdge({ id: "e4", source: "c1", target: "c2", kind: "dependency" }),
      ],
    });

    await expectValidMermaid(diagramToMermaid(diagram));
  });

  it("同名クラスがあっても Mermaid を通る", async () => {
    const diagram = makeDiagram({
      classes: [
        makeClass({ id: "c1", name: "Book" }),
        makeClass({ id: "c2", name: "Book" }),
      ],
      edges: [makeEdge({ source: "c1", target: "c2" })],
    });

    await expectValidMermaid(diagramToMermaid(diagram));
  });

  it("記号だけ・空の名前のクラスがあっても Mermaid を通る", async () => {
    const diagram = makeDiagram({
      classes: [
        makeClass({ id: "c1", name: "()" }),
        makeClass({ id: "c2", name: "" }),
      ],
    });

    await expectValidMermaid(diagramToMermaid(diagram));
  });

  it("壊れたエッジ（存在しないクラス参照）があっても出力は成功する", async () => {
    const diagram = makeDiagram({
      classes: [makeClass({ id: "c1", name: "Book" })],
      edges: [makeEdge({ source: "c1", target: "消えたクラス" })],
    });

    const text = diagramToMermaid(diagram);
    expect(text).not.toContain("消えたクラス");
    await expectValidMermaid(text);
  });
});

describe("diagramToMermaid（出力の中身）", () => {
  it("クラスとメンバを classDiagram として組み立てる", () => {
    const diagram = makeDiagram({
      classes: [
        makeClass({
          name: "Book",
          stereotype: "abstract",
          attributes: [makeAttribute({ name: "title", type: "String" })],
          operations: [makeOperation({ name: "run" })],
        }),
      ],
    });

    expect(diagramToMermaid(diagram)).toBe(
      [
        "classDiagram",
        "    class Book {",
        "        <<abstract>>",
        "        -title: String",
        "        +run()",
        "    }",
      ].join("\n")
    );
  });

  it("中身が空のクラスは1行で出す", () => {
    const diagram = makeDiagram({ classes: [makeClass({ name: "Book" })] });
    expect(diagramToMermaid(diagram)).toBe(["classDiagram", "    class Book"].join("\n"));
  });

  it("名前が変わるときだけ表示ラベルを付ける", () => {
    const diagram = makeDiagram({ classes: [makeClass({ name: "注文 (Order)" })] });
    expect(diagramToMermaid(diagram)).toContain('class 注文__Order_["注文 (Order)"]');
  });

  it("同名クラスの2つ目にも元の名前をラベルで残す", () => {
    const diagram = makeDiagram({
      classes: [makeClass({ id: "c1", name: "Book" }), makeClass({ id: "c2", name: "Book" })],
    });
    const text = diagramToMermaid(diagram);

    expect(text).toContain("class Book\n");
    expect(text).toContain('class Book_2["Book"]');
  });

  it("パッケージ内のクラスを namespace で包み、外のクラスは外に出す", () => {
    const diagram = makeDiagram({
      classes: [
        makeClass({ id: "c1", name: "Book", position: { x: 10, y: 10 } }),
        makeClass({ id: "c2", name: "Library", position: { x: 900, y: 900 } }),
      ],
      packages: [makePackage({ id: "p1", name: "貸出" })],
    });

    expect(diagramToMermaid(diagram)).toBe(
      [
        "classDiagram",
        "    namespace 貸出 {",
        "        class Book",
        "    }",
        "    class Library",
      ].join("\n")
    );
  });

  it("namespace 名もサニタイズする", () => {
    const diagram = makeDiagram({
      classes: [makeClass({ position: { x: 10, y: 10 } })],
      packages: [makePackage({ name: "貸出 (Lending)" })],
    });
    expect(diagramToMermaid(diagram)).toContain("namespace 貸出__Lending_ {");
  });
});
