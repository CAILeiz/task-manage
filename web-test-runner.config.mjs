import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  files: ['tests/**/*.test.js'],
  testFramework: {
    config: {
      ui: 'bdd',
      timeout: '10000'
    }
  },
  plugins: [
    esbuildPlugin({ ts: true, jsx: true, tsx: true })
  ]
};
