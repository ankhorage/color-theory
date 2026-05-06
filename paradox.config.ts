import { defineParadoxConfig } from '@ankhorage/paradox';

export default defineParadoxConfig({
  mode: 'write',

  docs: {
    title: '@ankhorage/color-theory',
    description: '',
  },

  package: {
    entrypoints: ['src/index.ts'],
  },

  output: {
    dir: 'paradox',
  },
});
