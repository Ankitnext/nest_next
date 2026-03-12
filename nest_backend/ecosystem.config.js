// CI/CD Deploy Test - v1.0.3 (firewall port 22 opened)
module.exports = {
  apps: [
    {
      name: process.env.PM2_APP_NAME || 'nest-backend',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3001,
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
      },
    }
  ]
};
