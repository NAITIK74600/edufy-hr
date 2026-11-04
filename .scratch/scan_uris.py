import glob
import os
import re

files = glob.glob('**/*', recursive=True)
mongo_uris = {}

for f in files:
    if os.path.isfile(f) and not any(p in f for p in ['node_modules', '.git', 'dist', 'build']):
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
                matches = re.findall(r'mongodb(?:\+srv)?://[^\s"\'`<>]+', content)
                for m in matches:
                    if m not in mongo_uris:
                        mongo_uris[m] = []
                    mongo_uris[m].append(f)
        except Exception:
            pass

for uri, flist in mongo_uris.items():
    print(f'URI: {uri}')
    print(f'  Files: {flist[:5]} (total {len(flist)})\n')
