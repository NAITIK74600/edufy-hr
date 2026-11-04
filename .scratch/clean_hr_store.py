import re

with open('src/services/hrStore.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Bump STORAGE_KEY to v3
content = re.sub(r"const STORAGE_KEY = 'edufyi_hr_store_v\d+'", "const STORAGE_KEY = 'edufyi_hr_store_v3'", content)
content = re.sub(r"const STORAGE_PERSISTED_NOTIFICATIONS_KEY = 'edufyi_persisted_notifications_v\d+'", "const STORAGE_PERSISTED_NOTIFICATIONS_KEY = 'edufyi_persisted_notifications_v3'", content)
content = re.sub(r"const STORAGE_CLEARED_NOTIFICATIONS_KEY = 'edufyi_notifications_cleared_v\d+'", "const STORAGE_CLEARED_NOTIFICATIONS_KEY = 'edufyi_notifications_cleared_v3'", content)
content = re.sub(r"const STORAGE_DELETED_NOTIFICATIONS_KEY = 'edufyi_deleted_notifications_v\d+'", "const STORAGE_DELETED_NOTIFICATIONS_KEY = 'edufyi_deleted_notifications_v3'", content)

# 2. Empty INITIAL_ATTENDANCE
content = re.sub(r'const INITIAL_ATTENDANCE = \[[\s\S]*?\n\]', 'const INITIAL_ATTENDANCE = []', content)

# 3. Empty INITIAL_LEAVES
content = re.sub(r'const INITIAL_LEAVES = \[[\s\S]*?\n\]', 'const INITIAL_LEAVES = []', content)

# 4. Empty INITIAL_TASKS
content = re.sub(r'const INITIAL_TASKS = \[[\s\S]*?\n\]', 'const INITIAL_TASKS = []', content)

# 5. Empty INITIAL_TICKETS
content = re.sub(r'const INITIAL_TICKETS = \[[\s\S]*?\n\]', 'const INITIAL_TICKETS = []', content)

# 6. Empty INITIAL_ANNOUNCEMENTS
content = re.sub(r'const INITIAL_ANNOUNCEMENTS = \[[\s\S]*?\n\]', 'const INITIAL_ANNOUNCEMENTS = []', content)

# 7. Empty INITIAL_DAILY_REPORTS
content = re.sub(r'const INITIAL_DAILY_REPORTS = \[[\s\S]*?\n\]', 'const INITIAL_DAILY_REPORTS = []', content)

# 8. Empty INITIAL_EXPENSES
content = re.sub(r'const INITIAL_EXPENSES = \[[\s\S]*?\n\]', 'const INITIAL_EXPENSES = []', content)

# 9. Empty INITIAL_KUDOS
content = re.sub(r'const INITIAL_KUDOS = \[[\s\S]*?\n\]', 'const INITIAL_KUDOS = []', content)

# 10. Empty INITIAL_NOTIFICATIONS
content = re.sub(r'const INITIAL_NOTIFICATIONS = \[[\s\S]*?\n\]', 'const INITIAL_NOTIFICATIONS = []', content)

# 11. Empty INITIAL_PAYROLL_RECORDS
content = re.sub(r'const INITIAL_PAYROLL_RECORDS = \[[\s\S]*?\n\]', 'const INITIAL_PAYROLL_RECORDS = []', content)

# 12. Empty fallback auditLogs
content = re.sub(r'auditLogs: \[[\s\S]*?\],', 'auditLogs: [],', content)

with open('src/services/hrStore.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned hrStore.js dummy test arrays and bumped STORAGE_KEY to v3')

