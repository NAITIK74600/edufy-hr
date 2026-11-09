import os
import zipfile
import shutil

ROOT_DIR = "e:/hr dashbord"
os.chdir(ROOT_DIR)

# 1. Full Update Zips
TARGET_ZIPS = [
    "edufyi-hr-code-update.zip",
    "edufyi-hr-hosting.zip",
    "edufyi-hr-webuzo-deploy.zip",
]

INCLUDE_DIRS = [
    "dist",
    "server",
    "public",
    "src",
]

INCLUDE_FILES = [
    "server.js",
    "ecosystem.config.cjs",
    "package.json",
    "package-lock.json",
    "index.html",
    "vite.config.js",
    ".env.example",
]

def make_full_zip(zip_name):
    if os.path.exists(zip_name):
        try:
            os.remove(zip_name)
        except Exception as e:
            print(f"Warning removing {zip_name}: {e}")

    print(f"Creating {zip_name}...")
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in INCLUDE_FILES:
            if os.path.exists(f):
                zf.write(f, arcname=f)

        for d in INCLUDE_DIRS:
            if os.path.exists(d):
                for root, dirs, files in os.walk(d):
                    dirs[:] = [sub for sub in dirs if sub not in ["node_modules", ".git", ".scratch", "__pycache__"]]
                    for file in files:
                        if file.endswith((".pyc", ".DS_Store")):
                            continue
                        filepath = os.path.join(root, file)
                        arcname = os.path.relpath(filepath, ROOT_DIR)
                        zf.write(filepath, arcname=arcname)

    size_mb = os.path.getsize(zip_name) / (1024 * 1024)
    print(f"[OK] {zip_name} created successfully: {size_mb:.2f} MB")

for z in TARGET_ZIPS:
    make_full_zip(z)

# 2. Frontend Standalone Zip (edufyi-hr-frontend.zip)
frontend_zip = "edufyi-hr-frontend.zip"
if os.path.exists(frontend_zip):
    try:
        os.remove(frontend_zip)
    except Exception as e:
        print(f"Warning removing {frontend_zip}: {e}")

print(f"Creating {frontend_zip} from dist/...")
with zipfile.ZipFile(frontend_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    dist_dir = os.path.join(ROOT_DIR, "dist")
    if os.path.exists(dist_dir):
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, dist_dir)
                zf.write(filepath, arcname=arcname)

size_mb = os.path.getsize(frontend_zip) / (1024 * 1024)
print(f"[OK] {frontend_zip} created successfully: {size_mb:.2f} MB")

# 3. Backend Standalone Zip (edufyi-hr-backend.zip)
backend_zip = "edufyi-hr-backend.zip"
if os.path.exists(backend_zip):
    try:
        os.remove(backend_zip)
    except Exception as e:
        print(f"Warning removing {backend_zip}: {e}")

print(f"Creating {backend_zip}...")
backend_files = [
    "server.js",
    "ecosystem.config.cjs",
    "package.json",
    "package-lock.json",
    ".env.example",
]
with zipfile.ZipFile(backend_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for f in backend_files:
        if os.path.exists(f):
            zf.write(f, arcname=f)
    server_dir = os.path.join(ROOT_DIR, "server")
    if os.path.exists(server_dir):
        for root, dirs, files in os.walk(server_dir):
            dirs[:] = [sub for sub in dirs if sub not in ["node_modules", ".git", ".scratch", "__pycache__"]]
            for file in files:
                if file.endswith((".pyc", ".DS_Store")):
                    continue
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, ROOT_DIR)
                zf.write(filepath, arcname=arcname)

size_mb = os.path.getsize(backend_zip) / (1024 * 1024)
print(f"[OK] {backend_zip} created successfully: {size_mb:.2f} MB")
