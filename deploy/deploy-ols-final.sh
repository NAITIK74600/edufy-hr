#!/usr/bin/env bash
set -e

# ==============================================================================
# Edufyi HR Panel - Final OpenLiteSpeed Deployment for Ubuntu 24.04 (Noble)
# Target Directory: /usr/local/lsws/Example/html/node/
# Domain: https://edufyione.edufyitech.in
# ==============================================================================

echo "============================================================"
echo "🚀 Deploying Edufyi HR Panel to OpenLiteSpeed (/usr/local/lsws/Example/html/node/)"
echo "Target Domain: https://edufyione.edufyitech.in"
echo "============================================================"

# 1. Clean up broken MongoDB 7.0 repo list & install MongoDB 8.0 for Ubuntu 24.04 (noble)
echo "[1/5] Installing MongoDB 8.0 for Ubuntu 24.04 Noble..."
rm -f /etc/apt/sources.list.d/mongodb-org-7.0.list /etc/apt/sources.list.d/mongodb-org.list 2>/dev/null || true

if ! command -v mongod >/dev/null 2>&1; then
    curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-8.0.gpg
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-8.0.list
    apt-get update -y
    apt-get install -y mongodb-org
    systemctl daemon-reload
    systemctl enable mongod --now
fi
systemctl start mongod || true

# 2. Deploy Application Code into OpenLiteSpeed Node.js Directory
TARGET_DIR="/usr/local/lsws/Example/html/node"
echo "[2/5] Deploying codebase to $TARGET_DIR..."
mkdir -p "$TARGET_DIR"

# Clean old sample files
rm -rf /tmp/edufyi-hr-clone
git clone https://github.com/NAITIK74600/edufy-hr.git /tmp/edufyi-hr-clone
cp -r /tmp/edufyi-hr-clone/. "$TARGET_DIR/"
rm -rf /tmp/edufyi-hr-clone

# 3. Write Production Environment Configuration
echo "[3/5] Configuring production .env..."
cat << 'EOF' > "$TARGET_DIR/.env"
NODE_ENV=production
PORT=3000
JWT_SECRET=edufyi-secure-jwt-key-9f8e7d6c5b4a3210
MONGODB_URI=mongodb://127.0.0.1:27017/admin_edufytech_employee_portal
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
EOF

# 4. Install Dependencies
echo "[4/5] Installing production npm packages..."
cd "$TARGET_DIR"
npm install --production

# 5. Set Permissions & Trigger OpenLiteSpeed Reload
echo "[5/5] Setting permissions and reloading OpenLiteSpeed..."
mkdir -p "$TARGET_DIR/tmp"
touch "$TARGET_DIR/tmp/restart.txt"
chown -R nobody:nogroup "$TARGET_DIR" 2>/dev/null || chown -R www-data:www-data "$TARGET_DIR" 2>/dev/null || true
chmod -R 755 "$TARGET_DIR"

# Restart OpenLiteSpeed and touch restart trigger
systemctl restart lsws || /usr/local/lsws/bin/lswsctrl restart
touch "$TARGET_DIR/tmp/restart.txt"

# Clean up accidental artifacts in man1 if any remain
rm -rf /usr/local/lsws/lsphp83/share/man/man1/deploy 2>/dev/null || true

echo "============================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "Check your live site now: https://edufyione.edufyitech.in"
echo "============================================================"

