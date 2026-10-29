#!/usr/bin/env bash
set -e

# ==============================================================================
# Edufyi HR Panel - One-Click OpenLiteSpeed VPS Deployment Script
# Domain: https://edufyione.edufyitech.in
# ==============================================================================

echo "============================================================"
echo "🚀 Deploying Edufyi HR Panel to OpenLiteSpeed Server"
echo "Target: https://edufyione.edufyitech.in"
echo "============================================================"

# 1. Locate the OpenLiteSpeed Node.js App Directory
echo "[1/6] Detecting OpenLiteSpeed Node.js application directory..."
SAMPLE_FILE=$(grep -rnwl "Hello World" /usr/local/lsws /var/www /home 2>/dev/null | head -n 1)

if [ -n "$SAMPLE_FILE" ]; then
    APP_DIR=$(dirname "$SAMPLE_FILE")
    echo "Found active app directory: $APP_DIR"
else
    # Fallback paths for OpenLiteSpeed standard structures
    if [ -d "/var/www/vhosts/edufyione.edufyitech.in/html" ]; then
        APP_DIR="/var/www/vhosts/edufyione.edufyitech.in/html"
    elif [ -d "/usr/local/lsws/Example/html/node" ]; then
        APP_DIR="/usr/local/lsws/Example/html/node"
    elif [ -d "/usr/local/lsws/Example/html" ]; then
        APP_DIR="/usr/local/lsws/Example/html"
    else
        APP_DIR="/var/www/html"
    fi
    echo "Using default OpenLiteSpeed app directory: $APP_DIR"
fi

# Detect port used by original sample app (default is usually 3000 or 30005)
DETECTED_PORT="3000"
if [ -f "$SAMPLE_FILE" ]; then
    FOUND_PORT=$(grep -rohE "port = [0-9]+" "$SAMPLE_FILE" 2>/dev/null | awk '{print $3}' | head -n 1 || true)
    if [ -n "$FOUND_PORT" ]; then
        DETECTED_PORT="$FOUND_PORT"
    fi
fi
echo "Target application port: $DETECTED_PORT"

# 2. Ensure MongoDB is Installed and Running
echo "[2/6] Verifying MongoDB..."
if ! command -v mongod >/dev/null 2>&1; then
    echo "Installing MongoDB Community Edition..."
    curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | gpg --dearmor --yes -o /usr/share/keyrings/mongodb-server-7.0.gpg || true
    CODENAME=$(lsb_release -cs 2>/dev/null || echo "jammy")
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${CODENAME}/mongodb-org/7.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-7.0.list || true
    apt-get update -y || true
    apt-get install -y mongodb-org || apt-get install -y mongodb || true
    systemctl daemon-reload || true
    systemctl enable mongod --now || systemctl enable mongodb --now || true
fi
systemctl start mongod 2>/dev/null || systemctl start mongodb 2>/dev/null || true

# 3. Deploy Application Codebase
echo "[3/6] Deploying clean HR panel code to $APP_DIR..."
mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ -f "$APP_DIR/app.js" ]; then
    cp "$APP_DIR/app.js" "$APP_DIR/app.js.backup.$(date +%s)"
fi

# Clone fresh copy from GitHub
rm -rf /tmp/edufyi-hr-deploy
git clone https://github.com/NAITIK74600/edufy-hr.git /tmp/edufyi-hr-deploy
cp -r /tmp/edufyi-hr-deploy/. "$APP_DIR/"
rm -rf /tmp/edufyi-hr-deploy

# 4. Generate Production .env
echo "[4/6] Creating production environment configuration..."
cat << EOF > "$APP_DIR/.env"
NODE_ENV=production
PORT=$DETECTED_PORT
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

# 5. Install Dependencies & Set Permissions
echo "[5/6] Installing production dependencies and configuring permissions..."
npm install --production

# OpenLiteSpeed restart trigger
mkdir -p "$APP_DIR/tmp"
touch "$APP_DIR/tmp/restart.txt"

# Set correct permissions so OpenLiteSpeed (nobody/nogroup) can read files
chown -R nobody:nogroup "$APP_DIR" 2>/dev/null || chown -R www-data:www-data "$APP_DIR" 2>/dev/null || true
chmod -R 755 "$APP_DIR"

# 6. Reload OpenLiteSpeed
echo "[6/6] Reloading OpenLiteSpeed..."
systemctl restart lsws 2>/dev/null || /usr/local/lsws/bin/lswsctrl restart 2>/dev/null || true

echo "============================================================"
echo "🎉 SUCCESS! Edufyi HR Portal is now deployed on OpenLiteSpeed!"
echo "Visit your site now: https://edufyione.edufyitech.in"
echo "============================================================"
