import { describe, expect, it } from "vitest";

import { createNameRegistry, sanitizeMermaidName } from "@/lib/mermaid/identifiers";
import { makeClass } from "@/lib/mermaid/testFixtures";

describe("sanitizeMermaidName", () => {
  it("英数字・日本語・アンダースコア・ダッシュはそのまま通す", () => {
    expect(sanitizeMermaidName("Book")).toBe("Book");
    expect(sanitizeMermaidName("書籍")).toBe("書籍");
    expect(sanitizeMermaidName("Book_v2")).toBe("Book_v2");
    expect(sanitizeMermaidName("Book-2")).toBe("Book-2");
  });

  it("Mermaid が受け付けない文字を _ に置換する", () => {
    expect(sanitizeMermaidName("注文 (Order)")).toBe("注文__Order_");
    expect(sanitizeMermaidName("My Class")).toBe("My_Class");
    expect(sanitizeMermaidName("Book#1")).toBe("Book_1");
    expect(sanitizeMermaidName("a/b")).toBe("a_b");
  });

  it("記号だけの名前は置換後の _ が残る（Mermaid の識別子として有効）", () => {
    expect(sanitizeMermaidName("()")).toBe("__");
  });

  it("名前が空のときだけ代替名を返す", () => {
    expect(sanitizeMermaidName("")).toBe("Class");
  });
});

describe("createNameRegistry", () => {
  it("ClassNode.id から Mermaid 識別子を引ける", () => {
    const registry = createNameRegistry([makeClass({ id: "c1", name: "Book" })]);
    expect(registry.idOf("c1")).toBe("Book");
  });

  it("未知の id には null を返す", () => {
    const registry = createNameRegistry([makeClass({ id: "c1" })]);
    expect(registry.idOf("存在しない")).toBeNull();
  });

  it("同名クラスは連番で一意にする", () => {
    const registry = createNameRegistry([
      makeClass({ id: "c1", name: "Book" }),
      makeClass({ id: "c2", name: "Book" }),
      makeClass({ id: "c3", name: "Book" }),
    ]);
    expect(registry.idOf("c1")).toBe("Book");
    expect(registry.idOf("c2")).toBe("Book_2");
    expect(registry.idOf("c3")).toBe("Book_3");
  });

  it("サニタイズの結果として衝突した名前も一意にする", () => {
    const registry = createNameRegistry([
      makeClass({ id: "c1", name: "My Class" }),
      makeClass({ id: "c2", name: "My(Class" }),
    ]);
    expect(registry.idOf("c1")).toBe("My_Class");
    expect(registry.idOf("c2")).toBe("My_Class_2");
  });
});
