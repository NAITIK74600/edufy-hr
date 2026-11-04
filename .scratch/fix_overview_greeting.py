with open('src/pages/OverviewPage.jsx', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

# 1. Update greeting import
old_import = "import { getTimeOfDayGreeting } from '../utils/greeting'"
new_import = "import { getTimeOfDayGreeting, resolveUserDisplayName } from '../utils/greeting'"

assert old_import in text, "old_import not found in OverviewPage.jsx"
text = text.replace(old_import, new_import, 1)

# 2. Update PageHeader in OverviewPage
old_header = """  const isAdmin = user?.role === 'admin'"""
new_header = """  const isAdmin = user?.role === 'admin'
  const isExecutive = ['director', 'managing_director', 'co_founder', 'vertical_head'].includes(user?.role) || user?.email === 'jagadishbabu@edufyitech.in'
  const greetingName = isAdmin
    ? 'Admin'
    : isExecutive
    ? (user?.displayName || user?.name || resolveUserDisplayName(user, storeState?.employees || []) || 'Jagadish Babu')
    : (user?.role === 'hr' || user?.role === 'hr_executive')
    ? 'HR'
    : resolveUserDisplayName(user, storeState?.employees || [])"""

assert old_header in text, "old_header not found in OverviewPage.jsx"
text = text.replace(old_header, new_header, 1)

old_page_header = """      <PageHeader
        eyebrow={isAdmin ? 'Executive Administration' : 'Enterprise HR Operations'}
        title={`${getTimeOfDayGreeting()}, ${isAdmin ? 'Admin' : 'HR'} ${isAdmin ? '🛡️' : '✦'}`}
        description={
          isAdmin
            ? 'Centralized administration, user account provisioning, office Wi-Fi security parameters, and live workforce telemetry.'
            : 'Comprehensive workforce management, real-time presence verification, automated payroll, and employee self-service.'
        }
      >
        <Button as="a" href={isAdmin ? '#/admin/users' : '#/hr/people'}>
          <Users size={16} /> {isAdmin ? 'Manage System Users' : 'View Employee Directory'}
        </Button>
      </PageHeader>"""

new_page_header = """      <PageHeader
        eyebrow={isAdmin ? 'Executive Administration' : isExecutive ? 'Executive Leadership Console' : 'Enterprise HR Operations'}
        title={`${getTimeOfDayGreeting()}, ${greetingName} ${isAdmin ? '🛡️' : isExecutive ? '👔' : '✦'}`}
        description={
          isExecutive
            ? 'Executive overview of workforce operations, attendance rhythm, and organizational analytics.'
            : isAdmin
            ? 'Centralized administration, user account provisioning, office Wi-Fi security parameters, and live workforce telemetry.'
            : 'Comprehensive workforce management, real-time presence verification, automated payroll, and employee self-service.'
        }
      >
        <Button as="a" href={isAdmin ? '#/admin/users' : isExecutive ? '#/hr/people' : '#/hr/people'}>
          <Users size={16} /> {isAdmin ? 'Manage System Users' : 'View Employee Directory'}
        </Button>
      </PageHeader>"""

assert old_page_header in text, "old_page_header not found in OverviewPage.jsx"
text = text.replace(old_page_header, new_page_header, 1)

output = text.replace('\n', '\r\n')
with open('src/pages/OverviewPage.jsx', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated src/pages/OverviewPage.jsx")

