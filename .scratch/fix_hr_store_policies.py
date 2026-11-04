with open('src/services/hrStore.js', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

old_load_browser = """      payroll: [],
      roles: INITIAL_ROLES,
      customRolePermissions: {},
      auditLogs: [],
      dataReady: false,"""

new_load_browser = """      payroll: [],
      leavePolicies: [],
      roles: INITIAL_ROLES,
      customRolePermissions: {},
      auditLogs: [],
      dataReady: false,"""

if old_load_browser in text:
    text = text.replace(old_load_browser, new_load_browser, 1)

old_load_node = """    payroll: INITIAL_PAYROLL_RECORDS,
    roles: INITIAL_ROLES,
    customRolePermissions: {},
    auditLogs: [],
    dataReady: true,"""

new_load_node = """    payroll: INITIAL_PAYROLL_RECORDS,
    leavePolicies: [],
    roles: INITIAL_ROLES,
    customRolePermissions: {},
    auditLogs: [],
    dataReady: true,"""

if old_load_node in text:
    text = text.replace(old_load_node, new_load_node, 1)

output = text.replace('\n', '\r\n')
with open('src/services/hrStore.js', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated src/services/hrStore.js")

