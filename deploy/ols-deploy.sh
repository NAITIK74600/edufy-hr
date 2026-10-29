#!/usr/bin/env bash
set -e

# ==============================================================================
# Edufyi HR Panel - One-Click OpenLiteSpeed VPS Deployment Script (v2)
# Domain: https://edufyione.edufyitech.in
# ==============================================================================

echo "============================================================"
echo "🚀 Deploying Edufyi HR Panel to OpenLiteSpeed Server"
echo "Target: https://edufyione.edufyitech.in"
echo "============================================================"

# 0. Clean up accidental deployment to man1 if present
if [ -d "/usr/local/lsws/lsphp83/share/man/man1/server" ]; then
    echo "Cleaning up prior test artifacts in man1..."
    rm -rf /usr/local/lsws/lsphp83/share/man/man1/server \
           /usr/local/lsws/lsphp83/share/man/man1/src \
           /usr/local/lsws/lsphp83/share/man/man1/dist \
           /usr/local/lsws/lsphp83/share/man/man1/public \
           /usr/local/lsws/lsphp83/share/man/man1/node_modules \
           /usr/local/lsws/lsphp83/share/man/man1/.env \
           /usr/local/lsws/lsphp83/share/man/man1/package*.json 2>/dev/null || true
fi

# 1. Install MongoDB correctly for Ubuntu 22.04 / 24.04
echo "[1/5] Setting up MongoDB Database..."
if ! command -v mongod >/dev/null 2>&1; then
    CODENAME=$(lsb_release -cs 2>/dev/null || echo "jammy")
    if [ "$CODENAME" = "noble" ]; then
        MONGO_VER="8.0"
    else
        MONGO_VER="7.0"
        CODENAME="jammy"
    fi
    echo "Installing MongoDB $MONGO_VER for Ubuntu ($CODENAME)..."
    curl -fsSL "https://www.mongodb.org/static/pgp/server-${MONGO_VER}.asc" | gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server.gpg || true
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server.gpg ] https://repo.mongodb.org/apt/ubuntu ${CODENAME}/mongodb-org/${MONGO_VER} multiverse" > /etc/apt/sources.list.d/mongodb-org.list || true
    apt-get update -y || true
    apt-get install -y mongodb-org || apt-get install -y mongodb || true
    systemctl daemon-reload || true
    systemctl enable mongod --now || systemctl enable mongodb --now || true
fi
systemctl start mongod 2>/dev/null || systemctl start mongodb 2>/dev/null || true

# 2. Locate the Active OpenLiteSpeed Node.js Application Directory
echo "[2/5] Locating OpenLiteSpeed Node.js app directory..."

# Try 1: Check OpenLiteSpeed virtual host config
APP_DIR=$(grep -h "location" /usr/local/lsws/conf/vhosts/*/vhconf.conf 2>/dev/null | awk '{print $2}' | tr -d '\r' | head -n 1 || true)

# Try 2: Grep for the exact placeholder string served by OpenLiteSpeed
if [ -z "$APP_DIR" ] || [ ! -d "$APP_DIR" ]; then
    EXACT_FILE=$(grep -rl "From OpenLiteSpeed NodeJS" /usr/local/lsws /var/www /root /home /opt 2>/dev/null | head -n 1 || true)
    if [ -n "$EXACT_FILE" ]; then
        APP_DIR=$(dirname "$EXACT_FILE")
    fi
fi

# Try 3: Standard known default paths
if [ -z "$APP_DIR" ] || [ ! -d "$APP_DIR" ]; then
    if [ -d "/usr/local/lsws/Example/html/node" ]; then
        APP_DIR="/usr/local/lsws/Example/html/node"
    elif [ -d "/usr/local/lsws/Example/html" ]; then
        APP_DIR="/usr/local/lsws/Example/html"
    elif [ -d "/var/www/vhosts/edufyione.edufyitech.in/html" ]; then
        APP_DIR="/var/www/vhosts/edufyione.edufyitech.in/html"
    else
        APP_DIR="/var/www/html"
    fi
fi

echo "Target Application Directory: $APP_DIR"

# 3. Deploy Application Codebase
echo "[3/5] Deploying clean HR panel code to $APP_DIR..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ -f "$APP_DIR/app.js" ]; then
    cp "$APP_DIR/app.js" "$APP_DIR/app.js.sample.bak" 2>/dev/null || true
fi

rm -rf /tmp/edufyi-hr-deploy
git clone https://github.com/NAITIK74600/edufy-hr.git /tmp/edufyi-hr-deploy
cp -r /tmp/edufyi-hr-deploy/. "$APP_DIR/"
rm -rf /tmp/edufyi-hr-deploy

# 4. Generate Production .env
echo "[4/5] Writing production .env..."
cat << 'EOF' > "$APP_DIR/.env"
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

# 5. Install Dependencies & Restart
echo "[5/5] Installing dependencies and restarting server..."
npm install --production

# Create restart trigger for OpenLiteSpeed App Server
mkdir -p "$APP_DIR/tmp"
touch "$APP_DIR/tmp/restart.txt"

# Set permissions for OpenLiteSpeed (nobody:nogroup)
chown -R nobody:nogroup "$APP_DIR" 2>/dev/null || chown -R www-data:www-data "$APP_DIR" 2>/dev/null || true
chmod -R 755 "$APP_DIR"

# Restart OpenLiteSpeed web server
systemctl restart lsws 2>/dev/null || /usr/local/lsws/bin/lswsctrl restart 2>/dev/null || true
touch "$APP_DIR/tmp/restart.txt"

echo "============================================================"
echo "🎉 SUCCESS! Edufyi HR Portal has been deployed!"
echo "App Directory: $APP_DIR"
echo "Check your live site: https://edufyione.edufyitech.in"
echo "============================================================"
