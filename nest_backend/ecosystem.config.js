// CI/CD Deploy Test - v1.0.2 (SSH key fixed)
module.exports = {
  apps: [
    {
      name: 'nest-backend',
      script: 'dist/main.js',
      instances: 'max', // or a specific number depending on the VPS cores
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    }
  ]
};
