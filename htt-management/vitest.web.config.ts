import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', pool: 'forks', maxWorkers: 1, testTimeout: 20000, hookTimeout: 20000 } });
