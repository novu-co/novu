/// <reference types="vitest" />

require('dotenv').config({ path: '.env.test' });

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.spec.ts'],
    globals: true,
    env: process.env,
  },
});
