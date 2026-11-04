import os
import zipfile

ZIP_NAME = "edufyi-hr-hosting.zip"

INCLUDE_DIRS = [
    "dist",
    "server/src",
    "public",
]

INCLUDE_FILES = [
    "server.js",
    "ecosystem.config.cjs",
    "package.json",
    "package-lock.json",
    ".env.example",
]

def create_zip():
    if os.path.exists(ZIP_NAME):
        os.remove(ZIP_NAME)
        print(f"Removed previous {ZIP_NAME}")

    with zipfile.ZipFile(ZIP_NAME, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add individual files
        for f in INCLUDE_FILES:
            if os.path.exists(f):
                zf.write(f, arcname=f)
                print(f"Added file: {f}")

        # Add directories
        for d in INCLUDE_DIRS:
            if os.path.exists(d):
                for root, dirs, files in os.walk(d):
                    # Skip __pycache__ or temporary files
                    dirs[:] = [sub for sub in dirs if sub not in ["__pycache__", ".git", ".scratch"]]
                    for file in files:
                        if file.endswith((".pyc", ".DS_Store")):
                            continue
                        filepath = os.path.join(root, file)
                        arcname = os.path.relpath(filepath, ".")
                        zf.write(filepath, arcname=arcname)
                print(f"Added directory: {d}")

    size_mb = os.path.getsize(ZIP_NAME) / (1024 * 1024)
    print(f"\nDone! Created {ZIP_NAME} ({size_mb:.2f} MB)")

if __name__ == "__main__":
    create_zip()

