import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

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
      correctness: "warn",
    },
    env: {
      builtin: true,
    },
    ignorePatterns: ["dist/**"],
    jsPlugins: [
      {
        name: "react-compiler",
        specifier: "eslint-plugin-react-compiler",
      },
    ],
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
          "no-array-constructor": "error",
          "no-case-declarations": "warn",
          "no-empty": "warn",
          "no-fallthrough": "error",
          "no-redeclare": "error",
          "no-regex-spaces": "error",
          "no-shadow": "warn",
          "no-unexpected-multiline": "error",
          "no-unneeded-ternary": "warn",
          "no-useless-concat": "warn",
          "oxc/no-accumulating-spread": "warn",
          "oxc/no-map-spread": "warn",
          "prefer-destructuring": "warn",
          "promise/no-nesting": "warn",
          "react-compiler/react-compiler": "error",
          "react/no-array-index-key": "allow",
          "react/rules-of-hooks": "error",
          "sort-keys": "warn",
          "typescript/ban-ts-comment": "error",
          "typescript/no-empty-object-type": "error",
          "typescript/no-explicit-any": "error",
          "typescript/no-misused-promises": "error",
          "typescript/no-namespace": "error",
          "typescript/no-require-imports": "error",
          "typescript/no-unnecessary-boolean-literal-compare": "warn",
          "typescript/no-unnecessary-type-assertion": "warn",
          "typescript/no-unnecessary-type-constraint": "warn",
          "typescript/no-unnecessary-type-conversion": "warn",
          "typescript/no-unnecessary-type-parameters": "warn",
          "typescript/no-unsafe-function-type": "error",
          "typescript/prefer-find": "warn",
          "typescript/prefer-reduce-type-parameter": "warn",
          "unicorn/no-array-reverse": "warn",
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
        },
      },
      {
        files: ["src/components/ui/*"],
        rules: {
          "no-shadow": "off",
          "react-compiler/react-compiler": "off",
          "react/only-export-components": "off",
          "unicorn/prefer-global-this": "off",
        },
      },
    ],
    plugins: ["oxc", "typescript", "unicorn", "react", "vitest"],
  },
  plugins: lazyPlugins(() => [react(), tailwindcss()]),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  run: {
    tasks: {
      build: {
        command: "vp build",
        dependsOn: ["tsgo", "check"],
      },
      check: {
        command: "vp check --fix",
      },
      dev: {
        command: "vp dev --host 0.0.0.0 --port 3333",
      },
      preview: {
        command: "vp preview --host 0.0.0.0 --port 2133",
      },
      tsgo: {
        command: "tsgo -b",
      },
    },
  },
  staged: {
    "*.{js,ts,tsx}": "vp check --fix",
  },
});
