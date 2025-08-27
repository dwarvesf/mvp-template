import { defineConfig } from 'orval';

export default defineConfig({
  mvpTemplate: {
    input: 'http://localhost:4000/docs-json',
    output: {
      target: 'packages/api-client/src/generated.ts',
      client: 'react-query',
      override: {
        mutator: {
          path: 'packages/api-client/src/axios.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
});
