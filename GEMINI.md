# Edufyi HR Panel — Project Context & Permanent Operating Rules

> [!IMPORTANT]
> **CRITICAL DEPLOYMENT RULE (PERMANENT):**
> 1. **DO NOT USE GITHUB / GIT ON THE PRODUCTION SERVER.** The remote server does NOT pull from GitHub.
> 2. **ALL DEPLOYMENTS ARE DONE STRICTLY VIA ZIP UPLOAD** to cPanel File Manager.
> 3. Never tell the user to run `git pull` on the server. Always build the distribution bundle, package the deployment zip files, and guide the user through the cPanel File Manager upload and Node.js App restart.

---

## 1. Production Server Specifications & Location

| Parameter | Production Value |
| :--- | :--- |
| **Domain** | `https://edufyione.edufyitech.in` |
| **cPanel / Webuzo Panel** | `https://103.14.121.243:2083/` |
| **Server Absolute Path** | `/home/admin_edufytech/EDUFYIONE` |
| **Node.js Runtime** | `Node.js 24` |
| **Configured Port** | **`30005`** *(STRICT: Never change to 30000, 3000, or 4001; reverse proxy expects 30005)* |
| **Database** | MongoDB 8 on `127.0.0.1:27017` (`admin_edufytech_employee_portal`) |

---

## 2. Standard Deployment Procedure (File Upload Only)

Whenever code changes (frontend or backend) are made:

1. **Build Frontend Bundle:**
   ```bash
   npm run build
   ```
2. **Rebuild Standalone Deployment Zip Archives:**
   ```bash
   python .scratch/build_deployment_zips.py
   ```
   This generates:
   - `edufyi-hr-code-update.zip` (full update with `dist/`, `server/`, `server.js`, `.env`, `tmp/restart.txt`)
   - `edufyi-hr-webuzo-deploy.zip`
   - `edufyi-hr-frontend.zip` (only `dist/` for frontend-only updates)
   - `edufyi-hr-backend.zip` (only `server/` for backend-only updates)

3. **User Action on cPanel File Manager:**
   - Open cPanel File Manager: `https://103.14.121.243:2083/` -> File Manager -> Navigate to `/home/admin_edufytech/EDUFYIONE`
   - Click **Upload** -> Select `edufyi-hr-code-update.zip`
   - Right-click uploaded zip -> Click **Extract** -> Overwrite existing files.
   - Go to cPanel **"Setup Node.js App"** -> Click **Restart** button (🔄) next to `edufyione`.

---

## 3. PWA & Mobile Cache Invalidation Rule

- The app uses a Service Worker PWA (`public/sw.js`).
- If UI or layout changes are made, bump the `CACHE_NAME` in `public/sw.js` (e.g. `edufyi-hr-pwa-v21` -> `v22`).
- This ensures mobile phones and client browsers automatically purge old cached bundles upon refresh.

