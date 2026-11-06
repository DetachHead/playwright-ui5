import comments from "@eslint-community/eslint-plugin-eslint-comments";
import stylistic from "@stylistic/eslint-plugin";
import type { Rule } from "eslint";
import preferArrowFunctions from "eslint-plugin-prefer-arrow-functions";
import { defineConfig, type DummyRuleMap } from "oxlint";

/** @see https://github.com/oxc-project/oxc/issues/24348#issuecomment-5029640005 */
const enableAllRulesFromJsPlugin = (
  pluginName: string,
  rules: { [name: string]: Rule.RuleModule },
): DummyRuleMap =>
  Object.fromEntries(
    Object.entries(rules)
      .filter(([_, rule]) => !rule.meta?.deprecated)
      .map(([ruleName, _]) => [`${pluginName}/${ruleName}`, "warn"]),
  );

/** Rules intended for public APIs, so we disable them in parts of the project that are not public */
const privateApiRuleConfig: DummyRuleMap = {
  "typescript/explicit-module-boundary-types": "off",
  "typescript/explicit-function-return-type": "off",
  "typescript/explicit-member-accessibility": "off",
};

export default defineConfig({
  plugins: ["typescript", "import", "jsdoc", "unicorn", "node", "oxc"],
  jsPlugins: [
    "@eslint-community/eslint-plugin-eslint-comments",
    "eslint-plugin-prefer-arrow-functions",
    "@stylistic/eslint-plugin",
  ],
  categories: {
    // We report most rules as a warning by default to differentiate between type errors in the IDE.
    // they are still configured to fail in CI (see `denyWarnings` below). however lint rules that are
    // very likely to cause a runtime failure should be configured to error instead
    correctness: "warn",
    nursery: "warn",
    pedantic: "warn",
    perf: "warn",
    restriction: "warn",
    style: "warn",
    suspicious: "warn",
  },
  options: {
    typeAware: true,
    denyWarnings: true,
    reportUnusedDisableDirectives: "warn",
    respectEslintDisableDirectives: true, // For eslint-comments plugin, see https://github.com/oxc-project/oxc/issues/17021
  },

  ignorePatterns: ["**/dist/**", "node_modules/**/*"],
  rules: {
    // Rules that come from an eslint plugin oxlint doesn't know about so we have to enable them explicitly
    ...enableAllRulesFromJsPlugin("@eslint-community/eslint-comments", comments.rules),
    ...enableAllRulesFromJsPlugin("@stylistic", stylistic.rules),
    ...enableAllRulesFromJsPlugin("prefer-arrow-functions", preferArrowFunctions.rules),

    // Rules we disable due to an issue (inclue a link)
    "unicorn/no-null": "off", // https://github.com/oxc-project/oxc/issues/23918
    "unicorn/prefer-dom-node-text-content": "off", // https://github.com/oxc-project/oxc/issues/23922
    "unicorn/require-post-message-target-origin": "off", // https://github.com/oxc-project/oxc/issues/24254

    // Rules we disable because we dont like them or they aren't relevant to this project:
    "no-warning-comments": "off",
    "sort-keys": "off",
    "no-inline-comments": "off",
    "no-undefined": "off",
    "max-classes-per-file": "off",
    "init-declarations": "off",
    "no-plusplus": "off",
    "no-void": "off", // Conflicts with typescript/no-floating-promises
    "no-ternary": "off", //  They can be abused, but for simple cases they are convenient
    "no-magic-numbers": "off", // Doesn't have an option to allow common numbers like 0 or 1
    "new-cap": "off", // We don't control the names of all the classes we call
    "preserve-caught-error": "off", // Pythonslop
    "no-continue": "off",
    "one-var": "off",
    "capitalized-comments": "off",
    "no-console": "off",
    "prefer-module": "off", // TODO: convert this project to esm
    "import/no-relative-parent-imports": "off",
    "import/group-exports": "off",
    "import/no-anonymous-default-export": "off",
    "import/no-default-export": "off",
    "import/no-named-export": "off",
    "import/prefer-default-export": "off",
    "typescript/no-unsafe-type-assertion": "off", // Ideally there'd be separate syntax for up/downcasting to make it more explicit, otherwise this rule is too annoying
    "typescript/promise-function-async": "off", // Using async keyword when it's not needed leads to people misunderstanding how async works
    "typescript/prefer-readonly-parameter-types": "off", // Enforces readonly in cases where we don't control the type and can't easily make it readonly
    "typescript/strict-boolean-expressions": "off",
    "import/consistent-type-specifier-style": "off", // Results in multiple import statements from the same module which looks gross and conflicts with another rule
    "unicorn/no-useless-undefined": "off", // Conflicts with no-useless-return and typescript's noImplicitReturns
    "unicorn/prefer-ternary": "off", // Often complains in cases where an if statement looks more readable
    "unicorn/prefer-type-error": "off",
    "unicorn/no-anonymous-default-export": "off",
    "node/no-top-level-await": "off", // We don't need dynamic imports or whatever this rule is for
    "oxc/no-async-await": "off",
    "oxc/no-rest-spread-properties": "off",
    "oxc/no-optional-chaining": "off",
    "@eslint-community/eslint-comments/no-use": "off",
    "@stylistic/line-comment-position": "off",
    "@stylistic/multiline-comment-style": "off",
    "@stylistic/padded-blocks": "off",
    "@stylistic/no-extra-parens": "off", // Often needed for readability
    "@stylistic/wrap-regex": "off", // Often needed for readability

    // Arbitrary limits like this are bad for a linter
    "max-statements": "off",
    "max-lines-per-function": "off",
    "max-lines": "off",
    "complexity": "off",

    // Rules disabled because they are covered by typescript
    "no-undef": "off",
    "default-case": "off",
    "jsdoc/require-returns-type": "off",
    "jsdoc/require-returns": "off",
    "jsdoc/require-param": "off",
    "jsdoc/require-param-type": "off",
    "import/no-nodejs-modules": "off",
    "import/named": "off",
    "import/unambiguous": "off", // Covered by `moduleDetection: "force"`
    "typescript/consistent-type-imports": "off",
    "typescript/consistent-return": "off", // Covered by noImplicitReturns

    // Rules we disable because they're covered by/conflict with oxfmt
    "sort-imports": "off",
    "@stylistic/quote-props": "off",
    "@stylistic/indent": "off",
    "@stylistic/max-len": "off",
    "@stylistic/object-property-newline": "off",
    "@stylistic/array-element-newline": "off",
    "@stylistic/object-curly-spacing": "off",
    "@stylistic/implicit-arrow-linebreak": "off",
    "@stylistic/comma-dangle": "off",
    "@stylistic/function-call-argument-newline": "off",
    "@stylistic/newline-per-chained-call": "off",
    "@stylistic/space-before-function-paren": "off",
    "@stylistic/function-paren-newline": "off",
    "@stylistic/operator-linebreak": "off",
    "@stylistic/dot-location": "off",
    "@stylistic/multiline-ternary": "off",
    "@stylistic/quotes": "off",
    "@stylistic/exp-list-style": "off",
    "@stylistic/indent-binary-ops": "off",
    "@stylistic/no-confusing-arrow": "off",

    // Rules we need to customize from their default behavior
    "no-unused-vars": [
      "warn",
      { args: "all", caughtErrors: "all", argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "id-length": ["warn", { checkGeneric: false, exceptions: ["_"] }],
    "typescript/no-floating-promises": ["warn", { ignoreIIFE: true }],
    "typescript/prefer-nullish-coalescing": ["warn", { ignorePrimitives: true }],
    "typescript/restrict-template-expressions": ["warn", { allowNullish: false }],
    "typescript/return-await": ["warn", "in-try-catch"],
    "typescript/no-unnecessary-condition": [
      "warn",
      { allowConstantLoopConditions: "only-allowed-literals", checkTypePredicates: true },
    ],
    "typescript/consistent-indexed-object-style": ["warn", "index-signature"], // More flexible than Record
    "typescript/switch-exhaustiveness-check": [
      "warn",
      { considerDefaultExhaustiveForUnions: true },
    ],
    "import/no-unassigned-import": ["warn", { allow: ["dotenv/config"] }],
    "import/no-commonjs": ["warn", { allowRequire: true }],
    "node/no-sync": ["warn", { ignores: ["execSync"] }], // Doesn't have a promise alternative
    "@eslint-community/eslint-comments/require-description": [
      "warn",
      { ignore: ["eslint-enable"] },
    ],
    "prefer-arrow-functions/prefer-arrow-functions": ["warn", { classPropertiesAllowed: true }],
    "@stylistic/lines-around-comment": [
      "warn",
      {
        allowBlockStart: true,
        allowObjectStart: true,
        allowArrayStart: true,
        allowClassStart: true,
        allowEnumStart: true,
        allowInterfaceStart: true,
        allowTypeStart: true,
        allowModuleStart: true,
      },
    ],
  },
  overrides: [
    {
      files: ["*.js", "*.cjs"],
      rules: {
        "import/no-commonjs": "off",
        "typescript/no-require-imports": "off",
        ...privateApiRuleConfig,
      },
    },
    { files: ["src/browser/**.*", "src/common/**.*", "tests/**/*"], rules: privateApiRuleConfig },
  ],
});
