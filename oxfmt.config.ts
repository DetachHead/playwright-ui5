import { defineConfig } from "oxfmt";

export default defineConfig({
  sortImports: true,
  ignorePatterns: ["node_modules", "dist", "pnpm-lock.json", "playwright-report", "test-results"],
  quoteProps: "consistent",
  jsdoc: true,
  proseWrap: "always",
});
