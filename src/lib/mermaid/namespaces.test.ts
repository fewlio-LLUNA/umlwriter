import { describe, expect, it } from "vitest";

import { groupClassesByPackage } from "@/lib/mermaid/namespaces";
import { makeClass, makePackage } from "@/lib/mermaid/testFixtures";

describe("groupClassesByPackage", () => {
  const pkg = makePackage({ id: "p1", position: { x: 100, y: 100 }, width: 300, height: 200 });

  it("枠の中のクラスはその namespace に入る", () => {
    const inside = makeClass({ id: "c1", position: { x: 150, y: 150 } });
    const result = groupClassesByPackage([inside], [pkg]);

    expect(result.grouped).toHaveLength(1);
    expect(result.grouped[0].classes).toEqual([inside]);
    expect(result.ungrouped).toEqual([]);
  });

  it("枠の外のクラスは namespace に入らない", () => {
    const outside = makeClass({ id: "c1", position: { x: 500, y: 500 } });
    const result = groupClassesByPackage([outside], [pkg]);

    expect(result.grouped).toEqual([]);
    expect(result.ungrouped).toEqual([outside]);
  });

  it("枠の境界上は中とみなす", () => {
    const onEdge = makeClass({ id: "c1", position: { x: 400, y: 300 } });
    expect(groupClassesByPackage([onEdge], [pkg]).ungrouped).toEqual([]);
  });

  it("パッケージが無ければ全部 ungrouped", () => {
    const cls = makeClass({ id: "c1", position: { x: 150, y: 150 } });
    expect(groupClassesByPackage([cls], []).ungrouped).toEqual([cls]);
  });

  it("クラスが1つも入っていないパッケージは namespace として出さない", () => {
    const outside = makeClass({ id: "c1", position: { x: 999, y: 999 } });
    expect(groupClassesByPackage([outside], [pkg]).grouped).toEqual([]);
  });

  it("枠が重なっていたら内側（面積が小さい方）に入れる", () => {
    const outer = makePackage({ id: "outer", position: { x: 0, y: 0 }, width: 800, height: 800 });
    const inner = makePackage({ id: "inner", position: { x: 100, y: 100 }, width: 200, height: 200 });
    const cls = makeClass({ id: "c1", position: { x: 150, y: 150 } });

    const result = groupClassesByPackage([cls], [outer, inner]);

    expect(result.grouped).toHaveLength(1);
    expect(result.grouped[0].pkg.id).toBe("inner");
  });

  it("クラスの並び順を保つ", () => {
    const a = makeClass({ id: "c1", name: "A", position: { x: 110, y: 110 } });
    const b = makeClass({ id: "c2", name: "B", position: { x: 120, y: 120 } });
    const result = groupClassesByPackage([a, b], [pkg]);

    expect(result.grouped[0].classes.map((c) => c.name)).toEqual(["A", "B"]);
  });
});
