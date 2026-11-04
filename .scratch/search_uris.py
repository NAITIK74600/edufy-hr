import subprocess
import re
import os

revs = subprocess.run(['git', 'rev-list', '--all'], capture_output=True, text=True).stdout.split()
print(f'Total commits: {len(revs)}')

found = set()
for r in revs:
    res = subprocess.run(['git', 'grep', '-i', 'mongodb', r], capture_output=True, text=True, errors='ignore').stdout
    for line in res.splitlines():
        if 'mongodb://' in line or 'mongodb+srv://' in line:
            match = re.search(r'mongodb(?:\+srv)?://[^\s"\'`]+', line)
            if match:
                found.add((r[:7], match.group(0)))

for c, uri in found:
    print(f'Commit {c}: {uri}')

# Also check git reflog commits
reflog_commits = [line.split()[0] for line in subprocess.run(['git', 'reflog'], capture_output=True, text=True).stdout.splitlines() if line.strip()]
print(f'Total reflog entries: {len(reflog_commits)}')
for r in set(reflog_commits):
    res = subprocess.run(['git', 'grep', '-i', 'mongodb', r], capture_output=True, text=True, errors='ignore').stdout
    for line in res.splitlines():
        if 'mongodb://' in line or 'mongodb+srv://' in line:
            match = re.search(r'mongodb(?:\+srv)?://[^\s"\'`]+', line)
            if match:
                found.add((r[:7], match.group(0)))

print("\n--- ALL RECOVERED MONGODB URIs ---")
for c, uri in sorted(found):
    print(f'[{c}] -> {uri}')
