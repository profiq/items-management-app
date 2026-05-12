import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: [
      'src/routes/Login.tsx',
      'src/routes/admin/**/*.tsx',
      'src/components/AdminRoute.tsx',
      'src/components/navigation-menu-reference.tsx',
      'src/components/hover-info.tsx',
      'src/components/status/status-spinning.tsx',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components/ui/*', '../components/ui/*'],
              message:
                'Auth and admin UI must use @profiq/ui components instead of local shadcn components.',
            },
          ],
        },
      ],
    },
  },
]);
