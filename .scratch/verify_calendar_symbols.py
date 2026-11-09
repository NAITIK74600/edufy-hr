import re

with open('src/components/calendar/EnterpriseCalendar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Collect imports
imports = set(re.findall(r'import\s+\{([^}]+)\}', text))
imported_names = set()
for imp in imports:
    for name in imp.split(','):
        name = name.strip()
        if ' as ' in name:
            imported_names.add(name.split(' as ')[1].strip())
        elif name:
            imported_names.add(name)

default_imports = set(re.findall(r'import\s+([A-Za-z0-9_]+)\s+from', text))
declared = set(re.findall(r'(?:const|let|var|function)\s+([A-Za-z0-9_]+)', text))

print("Current imported names:", sorted(imported_names))
print("Current default imports:", sorted(default_imports))

# Find all JSX tags
jsx_tags = set(re.findall(r'<([A-Z][a-zA-Z0-9]+)', text))
icon_props = set(re.findall(r'icon:\s*([A-Z][a-zA-Z0-9]+)', text))
all_needed = jsx_tags | icon_props

known = imported_names | default_imports | declared
missing = sorted([n for n in all_needed if n not in known])
print("MISSING SYMBOLS:", missing)

