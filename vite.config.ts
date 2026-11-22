import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";

export default defineConfig({
  base: "/map-stats/",
  build: {
    target: "esnext",
  },
  fmt: {
    bracketSameLine: false,
    ignorePatterns: ["dist/**"],
    printWidth: 100,
    sortImports: {
      customGroups: [
        {
          elementNamePattern: ["#ui/*", "#components/*", "#lib/*", "#hooks/*"],
          groupName: "shadcn",
        },
      ],
      groups: [
        "value-builtin",
        "value-external",
        "shadcn",
        ["value-internal", "value-parent", "value-sibling", "value-index"],
        "type-import",
        "unknown",
      ],
      internalPattern: ["@/", "#app/", "#routes/"],
    },
    sortPackageJson: true,
    sortTailwindcss: true,
  },
  lint: {
    categories: {
      correctness: "error",
    },
    env: {
      builtin: true,
    },
    ignorePatterns: [
      "dist/**",
      "src/components/ui/*",
      "src/hooks/use-mobile.ts",
      "src/lib/utils.ts",
    ],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    options: { typeAware: true, typeCheck: true },
    overrides: [
      {
        env: {
          browser: true,
          es2020: true,
        },
        files: ["**/*.{ts,tsx}"],
        globals: {
          AudioWorkletGlobalScope: "readonly",
          AudioWorkletProcessor: "readonly",
          WorkletGlobalScope: "readonly",
          currentFrame: "readonly",
          currentTime: "readonly",
          registerProcessor: "readonly",
          sampleRate: "readonly",
        },
        rules: {
          "react/exhaustive-deps": "warn",
          "react/only-export-components": [
            "error",
            {
              allowConstantExport: true,
            },
          ],
          "typescript/no-unsafe-assignment": "warn",
        },
      },
      {
        files: ["src/routes/**/*"],
        rules: {
          "react/only-export-components": "off",
          "sort-keys": "off",
        },
      },
      {
        files: ["src/app/Codes/CodeDashboard.tsx"],
        rules: {
          "sort-keys": "off",
        },
      },
    ],
    plugins: ["eslint", "oxc", "typescript", "unicorn", "react", "promise"],
    rules: {
      "import/export": "error",
      "no-array-constructor": "error",
      "no-await-in-loop": "error",
      "no-case-declarations": "warn",
      "no-empty": "warn",
      "no-fallthrough": "error",
      "no-redeclare": "error",
      "no-regex-spaces": "error",
      "no-shadow": "warn",
      "no-unexpected-multiline": "error",
      "no-unneeded-ternary": "warn",
      "no-useless-assignment": "warn",
      "no-useless-concat": "warn",
      "object-shorthand": "error",
      "oxc/no-accumulating-spread": "warn",
      "oxc/no-map-spread": "warn",
      "prefer-destructuring": "warn",
      "promise/no-nesting": "warn",
      "promise/no-return-in-finally": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-no-useless-fragment": "error",
      "react/no-array-index-key": "allow",
      "react/rules-of-hooks": "error",
      "sort-keys": "warn",
      "sort-vars": "warn",
      "typescript/ban-ts-comment": "error",
      "typescript/dot-notation": "warn",
      "typescript/method-signature-style": ["warn", "property"],
      "typescript/no-confusing-void-expression": "warn",
      "typescript/no-empty-object-type": "error",
      "typescript/no-explicit-any": "error",
      "typescript/no-import-type-side-effects": "warn",
      "typescript/no-invalid-void-type": "error",
      "typescript/no-misused-promises": "error",
      "typescript/no-mixed-enums": "error",
      "typescript/no-namespace": "error",
      "typescript/no-non-null-asserted-nullish-coalescing": "warn",
      "typescript/no-require-imports": "error",
      "typescript/no-unnecessary-boolean-literal-compare": "warn",
      "typescript/no-unnecessary-condition": "warn",
      "typescript/no-unnecessary-qualifier": "warn",
      "typescript/no-unnecessary-type-assertion": "warn",
      "typescript/no-unnecessary-type-constraint": "warn",
      "typescript/no-unnecessary-type-conversion": "warn",
      "typescript/no-unnecessary-type-parameters": "warn",
      "typescript/no-unsafe-argument": "error",
      "typescript/no-unsafe-assignment": "error",
      "typescript/no-unsafe-call": "error",
      "typescript/no-unsafe-function-type": "error",
      "typescript/no-unsafe-member-access": "error",
      "typescript/no-unsafe-return": "error",
      "typescript/non-nullable-type-assertion-style": "warn",
      "typescript/only-throw-error": [
        "error",
        {
          allow: [
            {
              from: "package",
              name: "Redirect",
              package: "@tanstack/router-core",
            },
            {
              from: "package",
              name: "NotFoundError",
              package: "@tanstack/router-core",
            },
          ],
        },
      ],
      "typescript/prefer-find": "warn",
      "typescript/prefer-includes": "warn",
      "typescript/prefer-literal-enum-member": "error",
      "typescript/prefer-optional-chain": "warn",
      "typescript/prefer-promise-reject-errors": "error",
      "typescript/prefer-reduce-type-parameter": "warn",
      "typescript/prefer-regexp-exec": "warn",
      "typescript/promise-function-async": "error",
      "typescript/require-await": "error",
      "typescript/restrict-plus-operands": "warn",
      "typescript/return-await": ["error", "always"],
      "typescript/strict-void-return": "warn",
      "typescript/switch-exhaustiveness-check": "error",
      "typescript/use-unknown-in-catch-callback-variable": "warn",
      "unicorn/no-array-reverse": "warn",
      "unicorn/no-useless-iterator-to-array": "warn",
      "unicorn/prefer-array-flat-map": "error",
      "unicorn/prefer-global-this": "warn",
      "unicorn/prefer-modern-dom-apis": "error",
      "unicorn/prefer-negative-index": "error",
      "unicorn/prefer-object-from-entries": "error",
      "unicorn/prefer-set-has": "warn",
      "unicorn/prefer-string-starts-ends-with": "error",
      "unicorn/prefer-ternary": "warn",
      "unicorn/throw-new-error": "error",
      "vars-on-top": "warn",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
  },

  plugins: [react({ compiler: true }), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      clsx: "cn",
      "tailwind-merge": "cn",
    },
    tsconfigPaths: true,
  },
  run: {
    tasks: {
      tsgo: {
        command: "tsgo -b",
      },
    },
  },
  staged: {
    "*.{js,ts,tsx}": "",
  },
});
