#!/usr/bin/env bash
#
# deploy.sh — One-click deployment script for personal website
# ==============================================================
# Usage:
#   First time:  ./deploy.sh setup      # Install system dependencies + PM2
#   Every time:  ./deploy.sh            # Pull latest, build, restart
#   Status:      ./deploy.sh status     # Show running status
#   Logs:        ./deploy.sh logs       # Tail live logs
#
# Run this on your VPS in the project root directory.
# ==============================================================

set -euo pipefail

APP_NAME="personalweb"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ---- helpers ----
red()    { echo -e "\033[0;31m$*\033[0m"; }
green()  { echo -e "\033[0;32m$*\033[0m"; }
yellow() { echo -e "\033[0;33m$*\033[0m"; }

require_env() {
  if [ ! -f "$PROJECT_DIR/.env.local" ]; then
    red "[ERROR] .env.local not found!"
    echo ""
    echo "Create $PROJECT_DIR/.env.local with the following content:"
    echo ""
    echo "  ADMIN_PASSWORD=<your-strong-admin-password>"
    echo "  SESSION_SECRET=<generated-random-secret>"
    echo ""
    echo "Generate a random secret with:"
    echo "  node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\""
    exit 1
  fi
}

# ---- commands ----
setup() {
  green "=== Setting up system dependencies ==="

  # Install Node.js 22.x if not present (uses NodeSource)
  if ! command -v node &>/dev/null; then
    yellow "Installing Node.js 22.x..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi

  # Install PM2 globally
  if ! command -v pm2 &>/dev/null; then
    yellow "Installing PM2..."
    npm install -g pm2
  fi

  # Install nginx (skip if already installed)
  if ! command -v nginx &>/dev/null; then
    yellow "Installing Nginx..."
    sudo apt-get update && sudo apt-get install -y nginx
  fi

  # Create logs directory
  mkdir -p "$PROJECT_DIR/logs"

  # Setup PM2 to start on boot
  pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true
  pm2 save

  green "[OK] System dependencies ready."
  echo ""
  yellow "Next steps:"
  echo "  1. Edit nginx.conf: replace 'your-domain.com' with your actual domain"
  echo "  2. Copy nginx.conf: sudo cp nginx.conf /etc/nginx/sites-available/$APP_NAME"
  echo "  3. Enable site: sudo ln -s /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/"
  echo "  4. Setup SSL: sudo certbot --nginx -d your-domain.com"
  echo "  5. Create .env.local with production credentials"
  echo "  6. Run: ./deploy.sh"
}

deploy() {
  green "=== Deploying $APP_NAME ==="

  require_env

  cd "$PROJECT_DIR"

  # Pull latest code
  if [ -d .git ]; then
    yellow "Pulling latest code..."
    git pull origin master 2>/dev/null || git pull origin main 2>/dev/null || yellow "[SKIP] Not a git repo or no remote"
  fi

  # Install dependencies
  yellow "Installing dependencies..."
  npm ci --omit=dev 2>/dev/null || npm install --omit=dev

  # Build
  yellow "Building..."
  npm run build

  # Restart or start the app
  if pm2 show "$APP_NAME" &>/dev/null; then
    yellow "Restarting $APP_NAME..."
    pm2 restart "$APP_NAME"
  else
    yellow "Starting $APP_NAME..."
    pm2 start ecosystem.config.cjs
  fi

  pm2 save
  green "[OK] Deployment complete!"
  echo ""
  pm2 status
}

status() {
  pm2 status
}

logs() {
  pm2 logs "$APP_NAME" --raw "$@"
}

# ---- main ----
case "${1:-deploy}" in
  setup)  setup ;;
  status) status ;;
  logs)   logs "${@:2}" ;;
  deploy) deploy ;;
  *)
    echo "Usage: ./deploy.sh [setup|status|logs|deploy]"
    exit 1
    ;;
esac
