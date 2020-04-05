export default {
    input: 'app.js',
    output: {
      file: 'index.js',
      format: 'cjs'
    },
    external: ['aws-sdk/clients/s3']
  };