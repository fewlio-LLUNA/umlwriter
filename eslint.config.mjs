import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// eslint-config-next 16 はフラット設定を直接エクスポートするため、
// FlatCompat による旧 eslintrc 変換は不要（変換すると ESLint 10 で
// 設定検証が循環参照で落ちる）。フラット設定をそのまま展開する。
const eslintConfig = [
  // ビルド成果物・依存はリント対象外にする。
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default eslintConfig;
