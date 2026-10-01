// eslint.config.js — ESLint 9 flat config (migrated from .eslintrc.cjs in T1.3).
//
// Faithful port of the old config: eslint:recommended + typescript-eslint
// recommended + react-hooks recommended + react-refresh's export rule.
// Deviations, all deliberate:
//   * `plugin:storybook/recommended` dropped — the repo contains zero
//     *.stories.* files, so the preset only linted nothing.
//   * env: browser/es2020 → languageOptions.globals (flat-config equivalent).
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  { ignores: ['dist/', 'node_modules/'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Classic react-hooks rules only. The plugin's v6 `recommended` also
      // enables the React-Compiler rules (set-state-in-effect, immutability,
      // preserve-manual-memoization) which the pre-migration toolchain never
      // had — enabling them flags 11 pre-existing effect idioms that are a
      // behavioural refactor, not part of the config migration.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': 'warn',
      // T3.5: the ~30 `any`/`@ts-ignore` sites found at T1.3 migration time are
      // swept (typed Supabase row shapes, ChipProps, a withTarget<T> helper for
      // the comments/images insert payloads) — rule re-enabled at its recommended
      // default (error).
    },
  }
);
