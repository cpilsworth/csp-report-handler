import json from '@rollup/plugin-json';

export default {
    input: 'app.js',
    output: {
      file: 'index.js',
      format: 'cjs'
    },
    external: ['aws-sdk/clients/s3'],
    plugins: [json()]
  };