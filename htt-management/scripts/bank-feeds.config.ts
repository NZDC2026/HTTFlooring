import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['scripts/bank-feeds.fixture.ts'] } });
