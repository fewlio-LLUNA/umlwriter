import { describe, expect, it } from "vitest";

import {
  formatAttributeMember,
  formatMermaidType,
  formatOperationMember,
} from "@/lib/mermaid/members";
import { makeAttribute, makeOperation } from "@/lib/mermaid/testFixtures";

describe("formatAttributeMember", () => {
  it("可視性・名前・型を並べる", () => {
    expect(
      formatAttributeMember(makeAttribute({ visibility: "-", name: "title", type: "String" }))
    ).toBe("-title: String");
  });

  it("型が未入力なら型部分を省く", () => {
    expect(formatAttributeMember(makeAttribute({ visibility: "+", name: "id" }))).toBe("+id");
  });

  it("static は末尾に $ を付ける", () => {
    expect(
      formatAttributeMember(
        makeAttribute({ visibility: "#", name: "count", type: "int", isStatic: true })
      )
    ).toBe("#count: int$");
  });
});

describe("formatOperationMember", () => {
  it("引数と戻り型を並べる（戻り型は括弧の後ろに半角スペース区切り）", () => {
    expect(
      formatOperationMember(
        makeOperation({
          visibility: "+",
          name: "findById",
          parameters: [{ name: "id", type: "String" }],
          returnType: "Book",
        })
      )
    ).toBe("+findById(id: String) Book");
  });

  it("引数なし・戻り型なしでも括弧を残す", () => {
    expect(formatOperationMember(makeOperation({ visibility: "~", name: "run" }))).toBe("~run()");
  });

  it("static は括弧の直後に $ を置く", () => {
    expect(
      formatOperationMember(
        makeOperation({ name: "create", returnType: "Book", isStatic: true })
      )
    ).toBe("+create()$ Book");
  });

  it("abstract は括弧の直後に * を置く", () => {
    expect(
      formatOperationMember(makeOperation({ name: "draw", isAbstract: true }))
    ).toBe("+draw()*");
  });

  it("static と abstract が両立したら static を優先する（分類子は1つだけ）", () => {
    expect(
      formatOperationMember(
        makeOperation({ name: "x", isStatic: true, isAbstract: true })
      )
    ).toBe("+x()$");
  });

  it("引数が複数あればカンマ区切りにする", () => {
    expect(
      formatOperationMember(
        makeOperation({
          name: "move",
          parameters: [{ name: "x", type: "int" }, { name: "y" }],
        })
      )
    ).toBe("+move(x: int, y)");
  });
});

describe("formatMermaidType", () => {
  it("ジェネリクスを ~ 記法へ変換する", () => {
    expect(formatMermaidType("List<String>")).toBe("List~String~");
  });

  it("カンマを含むジェネリクスは Mermaid 非対応なので素通しする", () => {
    expect(formatMermaidType("Map<K, V>")).toBe("Map<K, V>");
  });

  it("ジェネリクスでない型はそのまま", () => {
    expect(formatMermaidType("String")).toBe("String");
  });
});
