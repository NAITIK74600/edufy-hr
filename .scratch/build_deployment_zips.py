import os
import zipfile
import shutil

ROOT_DIR = "e:/hr dashbord"
os.chdir(ROOT_DIR)

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

def make_zip(zip_name):
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
                    # Exclude node_modules, .git, .scratch, __pycache__
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
    make_zip(z)
