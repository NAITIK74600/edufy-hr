#!/usr/bin/env bash
set -e

# ==============================================================================
# Edufyi HR Panel - Automated Setup Script for Fresh Ubuntu/Debian VPS
# Domain: https://edufyione.edufyitech.in
# Port: 30005
# ==============================================================================

echo "============================================================"
echo "🚀 Starting Edufyi HR Panel Deployment on $(hostname)"
echo "Target Domain: https://edufyione.edufyitech.in"
echo "============================================================"

# 1. Update system & basic dependencies
echo "[1/7] Updating package index..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl git ufw nginx certbot python3-certbot-nginx gnupg

# 2. Allow SSH and Web in UFW to prevent getting locked out
echo "[2/7] Configuring firewall..."
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
ufw --force enable || true

# 3. Install Node.js 20 LTS & PM2
echo "[3/7] Installing Node.js 20 LTS and PM2..."
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
npm install -g pm2

# 4. Install MongoDB Community Edition
echo "[4/7] Setting up MongoDB..."
if ! systemctl is-active --quiet mongod; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg
    UBUNTU_CODENAME=$(lsb_release -cs 2>/dev/null || echo "jammy")
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_CODENAME}/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-7.0.list
    apt-get update -y || true
    apt-get install -y mongodb-org || apt-get install -y mongodb || true
    systemctl daemon-reload || true
    systemctl start mongod || systemctl start mongodb || true
    systemctl enable mongod || systemctl enable mongodb || true
fi

# 5. Clone/Update HR Panel Project
echo "[5/7] Deploying application codebase..."
APP_DIR="/var/www/edufyi-hr"
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ -d ".git" ]; then
    git remote set-url origin https://github.com/NAITIK74600/edufy-hr.git
    git fetch origin main
    git reset --hard origin/main
else
    git clone https://github.com/NAITIK74600/edufy-hr.git .
fi

# Create production .env
cat << 'ENVFILE' > .env
NODE_ENV=production
PORT=30005
JWT_SECRET=edufyi-secure-prod-token-$(openssl rand -hex 16)
MONGODB_URI=mongodb://127.0.0.1:27017/edufyi_hr_portal
MONGO_POOL_SIZE=200
VITE_API_BASE_URL=/api/v1
APP_PUBLIC_URL=https://edufyione.edufyitech.in

ADMIN_EMAIL=admin@edufyitech.in
ADMIN_PASSWORD=Password@123
HR_EMAIL=hr@edufyitech.in
HR_PASSWORD=Password@123

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
ADMIN_EMAIL_PASS=ywly kgmv bbsm juca
HR_EMAIL_PASS=tzen ptmu smjq oyoi
IT_EMAIL=itsupport@edufyitech.in
IT_EMAIL_PASS=3CD<u&3S>rUQ6uD*
HELPDESK_EMAIL=helpsupport@edufyitechsolution.in
ENVFILE

npm install --production

# 6. Configure Nginx Reverse Proxy
echo "[6/7] Configuring Nginx reverse proxy..."
cat << 'NGINXCONF' > /etc/nginx/sites-available/edufyione.edufyitech.in
server {
    listen 80;
    server_name edufyione.edufyitech.in;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:30005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF

ln -sf /etc/nginx/sites-available/edufyione.edufyitech.in /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# 7. Start PM2 Process
echo "[7/7] Launching application under PM2 daemon..."
pm2 delete edufyione-hr 2>/dev/null || true
pm2 start server.js --name "edufyione-hr" --update-env
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "============================================================"
echo "✅ Edufyi HR Portal successfully deployed!"
echo "Backend Port: 30005 (Active)"
echo "Domain: https://edufyione.edufyitech.in"
echo "To issue SSL (HTTPS), run:"
echo "certbot --nginx -d edufyione.edufyitech.in --non-interactive --agree-tos -m admin@edufyitech.in --redirect"
echo "============================================================"
