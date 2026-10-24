import { ArrowLeft, Construction } from 'lucide-react'
import { Button, DataTable, Field, PageHeader, StatePanel, StatusBadge } from '../components/ui'

const examples = {
  People: { eyebrow: 'Workspace', description: 'Directory, employee profiles, onboarding, and employment history will live here.' },
  Leave: { eyebrow: 'Workspace', description: 'Company leave requests, balances, calendars, and approval stages will live here.' },
  Attendance: { eyebrow: 'Workspace', description: 'Daily records, exceptions, and correction requests will live here.' },
  Payroll: { eyebrow: 'Workspace', description: 'Restricted salary records and payslip publication will live here.' },
}

export function ModulePlaceholder({ route }) {
  const copy = examples[route.label] ?? { eyebrow: route.group, description: `${route.description} will be available here soon.` }
  return <>
    <PageHeader eyebrow={copy.eyebrow} title={route.label} description={copy.description}>
      <StatusBadge tone="warning">Coming soon</StatusBadge>
    </PageHeader>
    <StatePanel title="This workspace is being prepared" message="The navigation is ready. This area will appear here when it is available." tone="neutral" action={<Button as="a" href="#/hr" variant="secondary"><ArrowLeft size={15} /> Back to overview</Button>} />
    <section className="foundation-grid secondary-foundation-grid">
      <div className="panel foundation-panel"><div className="panel-heading"><div><p className="section-kicker">Shared primitives</p><h2>Available for this module</h2></div><Construction size={19} className="muted-icon" /></div><div className="primitive-list"><span>Page header</span><span>State panels</span><span>Status badges</span><span>Form fields</span><span>Data tables</span><span>Confirmation dialogs</span></div></div>
      <div className="panel foundation-panel"><div className="panel-heading"><div><p className="section-kicker">Workspace details</p><h2>Service resource</h2></div><StatusBadge tone="info">Planned</StatusBadge></div><Field label="Resource"><input disabled value={`/api/v1${route.path.replace('/hr', '') || '/dashboard/summary'}`} readOnly /></Field><DataTable caption="No records yet" columns={[{ key: 'status', label: 'Status' }]} rows={[]} emptyMessage="Nothing to display yet." /></div>
    </section>
  </>
}

export function NotFoundPage() {
  return <><PageHeader eyebrow="404" title="Page not found" description="This route is not part of the HR workspace."><Button as="a" href="#/hr" variant="secondary"><ArrowLeft size={15} /> Back to overview</Button></PageHeader><StatePanel title="Unknown route" message="Use the HR navigation to open a supported workspace." tone="error" /></>
}
