import re

with open('src/components/calendar/EnterpriseCalendar.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Collect all function names called: foo(...)
func_calls = set(re.findall(r'\b([a-z_][a-zA-Z0-9_]*)\(', text))

# Collect all declarations
decls = set(re.findall(r'(?:const|let|var|function)\s+([A-Za-z0-9_]+)', text))
destructured = set(re.findall(r'(?:const|let|var)\s+\[([^\]]+)\]', text))
for d in destructured:
    for item in d.split(','):
        decls.add(item.strip())

imports = set(re.findall(r'import\s+\{([^}]+)\}', text))
for imp in imports:
    for name in imp.split(','):
        name = name.strip()
        if ' as ' in name:
            decls.add(name.split(' as ')[1].strip())
        elif name:
            decls.add(name)

default_imports = set(re.findall(r'import\s+([A-Za-z0-9_]+)\s+from', text))
decls.update(default_imports)

builtins_methods = {
    'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent',
    'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'alert', 'confirm', 'prompt',
    'fetch', 'require', 'toString', 'indexOf', 'includes', 'trim', 'toLowerCase', 'toUpperCase',
    'slice', 'split', 'replace', 'map', 'filter', 'forEach', 'reduce', 'some', 'every', 'find',
    'push', 'join', 'sort', 'slice', 'concat', 'reverse', 'then', 'catch', 'finally', 'resolve',
    'reject', 'getDate', 'getMonth', 'getFullYear', 'getDay', 'getHours', 'getMinutes', 'getSeconds',
    'getTime', 'toISOString', 'toLocaleDateString', 'setDate', 'setHours', 'log', 'warn', 'error',
    'info', 'preventDefault', 'stopPropagation', 'setData', 'getData', 'removeEventListener',
    'addEventListener', 'matchMedia', 'match', 'startsWith', 'endsWith', 'has', 'get', 'set',
    'values', 'keys', 'entries', 'ceil', 'floor', 'round', 'min', 'max', 'abs', 'writeText',
    'readAsDataURL', 'readAsText', 'onload', 'click', 'appendChild', 'removeChild', 'setAttribute',
    'createObjectURL', 'revokeObjectURL', 'createElement', 'stringify', 'parse'
}

undeclared_funcs = [f for f in func_calls if f not in decls and f not in builtins_methods]
print("Potentially undeclared function calls:", sorted(set(undeclared_funcs)))
