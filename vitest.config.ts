import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * 単体テストの設定。
 *
 * environment を jsdom にしているのは、Mermaid の構文検証に使う `mermaid.parse()` が
 * DOM（DOMPurify 経由の window）を要求するため。変換ロジック自体は DOM に依存しない。
 */
export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
