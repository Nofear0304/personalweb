// PM2 ecosystem configuration for Next.js production deployment
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "personalweb",
      script: "node_modules/.bin/next",
      args: "start",
      // Server listening port (default 3000)
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // Restart if memory exceeds 512MB
      max_memory_restart: "512M",
      // Log configuration
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      // Merge logs from all instances
      merge_logs: true,
      // Auto-restart on crash
      autorestart: true,
      // Wait 5s before restart
      min_uptime: "5s",
      max_restarts: 10,
      // Watch for file changes (disable in production)
      watch: false,
    },
  ],
};
