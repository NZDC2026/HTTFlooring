import {defineConfig} from 'vitest/config';
export default defineConfig({test:{include:['scripts/external-services.fixture.ts']}});
