import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          include: ['src/**/*.unit-spec.{j,t}s{,x}'],
          name: 'unit',
          environment: 'node',
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
      {
        plugins: [react()],
        test: {
          include: ['src/**/*.component-spec.{j,t}s{,x}'],
          name: 'component',
          browser: {
            provider: playwright(),
            enabled: true,
            // at least one instance is required
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
    ],
  },
});
