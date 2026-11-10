import os
import zipfile
import shutil
import time

ROOT_DIR = "e:/hr dashbord"
os.chdir(ROOT_DIR)

# Files and directories STRICTLY needed for production hosting
# Excludes: .git, .agents, .scratch, scratch, src, test, tests, scripts, *.md, *.bat, *.ps1, cloudflared.exe, etc.

def build_code_update_zip(zip_name="edufyi-hr-code-update.zip"):
    if os.path.exists(zip_name):
        try:
            os.remove(zip_name)
        except Exception as e:
            print(f"Warning removing {zip_name}: {e}")

    print(f"\n==========================================")
    print(f"Packaging {zip_name} for Production Hosting...")
    print(f"==========================================")

    # Ensure tmp/restart.txt exists
    os.makedirs(os.path.join(ROOT_DIR, "tmp"), exist_ok=True)
    with open(os.path.join(ROOT_DIR, "tmp", "restart.txt"), "w") as f:
        f.write(f"restart-{time.time()}\n")

    files_added = []
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. Essential Root Files
        root_files = [
            "server.js",
            "ecosystem.config.cjs",
            "package.json",
            "package-lock.json",
            ".env",
            "tmp/restart.txt",
        ]
        for f in root_files:
            if os.path.exists(f):
                zf.write(f, arcname=f)
                files_added.append(f)

        # 2. Production Frontend Bundle (dist/)
        dist_dir = os.path.join(ROOT_DIR, "dist")
        if os.path.exists(dist_dir):
            for root, dirs, files in os.walk(dist_dir):
                for file in files:
                    filepath = os.path.join(root, file)
                    arcname = os.path.relpath(filepath, ROOT_DIR)
                    zf.write(filepath, arcname=arcname)
                    files_added.append(arcname)

        # 3. Production Backend Code (ONLY server/src/, NEVER server/test or server/scripts)
        server_src_dir = os.path.join(ROOT_DIR, "server", "src")
        if os.path.exists(server_src_dir):
            for root, dirs, files in os.walk(server_src_dir):
                dirs[:] = [d for d in dirs if d not in ["__pycache__", "test", "tests"]]
                for file in files:
                    if file.endswith((".test.js", ".spec.js", ".pyc", ".DS_Store")):
                        continue
                    filepath = os.path.join(root, file)
                    arcname = os.path.relpath(filepath, ROOT_DIR)
                    zf.write(filepath, arcname=arcname)
                    files_added.append(arcname)

        # 4. Public Assets (public/)
        public_dir = os.path.join(ROOT_DIR, "public")
        if os.path.exists(public_dir):
            for root, dirs, files in os.walk(public_dir):
                for file in files:
                    filepath = os.path.join(root, file)
                    arcname = os.path.relpath(filepath, ROOT_DIR)
                    zf.write(filepath, arcname=arcname)
                    files_added.append(arcname)

    size_mb = os.path.getsize(zip_name) / (1024 * 1024)
    print(f"✅ {zip_name} packaged successfully! Total files: {len(files_added)}, Size: {size_mb:.2f} MB")
    
    # Clone to aliases for compatibility
    for alias in ["edufyi-hr-webuzo-deploy.zip", "edufyi-hr-hosting.zip"]:
        try:
            shutil.copyfile(zip_name, alias)
            print(f"   -> Copied to alias: {alias}")
        except Exception as e:
            print(f"   -> Alias copy warning ({alias}): {e}")

    return zip_name

def build_frontend_zip(zip_name="edufyi-hr-frontend.zip"):
    if os.path.exists(zip_name):
        try:
            os.remove(zip_name)
        except Exception:
            pass
    print(f"\nPackaging {zip_name} (dist/ only)...")
    dist_dir = os.path.join(ROOT_DIR, "dist")
    files_count = 0
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zf:
        if os.path.exists(dist_dir):
            for root, dirs, files in os.walk(dist_dir):
                for file in files:
                    filepath = os.path.join(root, file)
                    arcname = os.path.relpath(filepath, dist_dir)
                    zf.write(filepath, arcname=arcname)
                    files_count += 1
    size_mb = os.path.getsize(zip_name) / (1024 * 1024)
    print(f"✅ {zip_name} created successfully: {files_count} files, {size_mb:.2f} MB")

def build_backend_zip(zip_name="edufyi-hr-backend.zip"):
    if os.path.exists(zip_name):
        try:
            os.remove(zip_name)
        except Exception:
            pass
    print(f"\nPackaging {zip_name} (Backend server/src only)...")
    files_added = []
    with zipfile.ZipFile(zip_name, "w", zipfile.ZIP_DEFLATED) as zf:
        for f in ["server.js", "ecosystem.config.cjs", "package.json", "package-lock.json", ".env", "tmp/restart.txt"]:
            if os.path.exists(f):
                zf.write(f, arcname=f)
                files_added.append(f)
        server_src_dir = os.path.join(ROOT_DIR, "server", "src")
        if os.path.exists(server_src_dir):
            for root, dirs, files in os.walk(server_src_dir):
                dirs[:] = [d for d in dirs if d not in ["__pycache__", "test", "tests"]]
                for file in files:
                    if file.endswith((".test.js", ".spec.js", ".pyc", ".DS_Store")):
                        continue
                    filepath = os.path.join(root, file)
                    arcname = os.path.relpath(filepath, ROOT_DIR)
                    zf.write(filepath, arcname=arcname)
                    files_added.append(arcname)
    size_mb = os.path.getsize(zip_name) / (1024 * 1024)
    print(f"✅ {zip_name} created successfully: {len(files_added)} files, {size_mb:.2f} MB")

if __name__ == "__main__":
    build_code_update_zip()
    build_frontend_zip()
    build_backend_zip()
    print("\nAll clean hosting archives generated without scratch, test, or unneeded files.")
