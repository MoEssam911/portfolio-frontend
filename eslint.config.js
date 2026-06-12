import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';

import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  {
    ignores: [
      'node_modules',
      '.nuxt',
      '.output',
      'dist',
      'public',
      'HTML Design',
    ],
  },
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      // ── Imports / exports: one consistent, auto-sorted order everywhere ──
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // ── TypeScript ──
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // ── Vue: structure & arrangement (all auto-fixable) ──
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'error',
      // Optional props are typed — the default-value warning is noise in <script setup lang="ts">.
      'vue/require-default-prop': 'off',
      // <script> MUST come before <template>, then <style>.
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
      // Consistent compiler-macro order at the top of <script setup>.
      'vue/define-macros-order': [
        'error',
        {
          order: ['defineOptions', 'defineModel', 'defineProps', 'defineEmits', 'defineSlots'],
          defineExposeLast: true,
        },
      ],
      // Consistent attribute order, casing, and event/prop hyphenation in templates.
      'vue/attributes-order': ['error', { alphabetical: false }],
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/v-on-event-hyphenation': ['error', 'always'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/html-comment-content-spacing': ['error', 'always'],
      'vue/prefer-separate-static-class': 'error',
      'vue/no-multiple-template-root': 'off',

      // ── General quality ──
      'no-console': 'warn',
      'no-debugger': 'warn',
      eqeqeq: ['error', 'smart'],
      curly: ['error', 'multi-line'],
      'no-implicit-coercion': 'warn',
      'object-shorthand': ['error', 'always'],
      'prefer-const': 'error',

      // ── Module boundaries — prevent cross-domain direct imports ──
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@modules/*/*'],
              message:
                'Do not import from another module directly. Use core/shared or same module only.',
            },
          ],
        },
      ],
    },
  },
  prettierConfig, // Always last — disables ESLint rules that conflict with Prettier
);
