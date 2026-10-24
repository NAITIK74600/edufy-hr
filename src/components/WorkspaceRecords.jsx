import { useEffect, useState } from 'react'
import { Button, DataTable, Field, PageHeader } from './ui'
import {
  Bell,
  CheckCircle2,
  CalendarDays,
  FileCheck,
  Megaphone,
  Search,
  ShieldCheck,
  Trash2,
  WalletCards,
  ExternalLink,
  Clock3,
  Receipt,
  FileText,
  AlertCircle,
  TrendingUp,
  Check,
  Paperclip,
  X,
  LifeBuoy,
} from 'lucide-react'
import { hrStore } from '../services/hrStore'
import { workspaceAction } from '../services/workspaceStore'
import { useAuth } from '../auth/AuthContext'
import { formatINR } from '../utils/currency'

function useWorkspaceState() {
  const [state, setState] = useState(() => hrStore.getState())
  useEffect(() => hrStore.subscribe(setState), [])
  return state
}
const action = (handler) => workspaceAction(hrStore, handler)

export function PerformanceWorkspace() {
  const state = useWorkspaceState()
  const { user } = useAuth()
  const management = ['admin', 'hr'].includes(user?.role)
  const [goal, setGoal] = useState({ employeeId: '', title: '', target: '', dueDate: '', progress: 0 })
  const [review, setReview] = useState({ employeeId: '', period: '', rating: '', comments: '' })
  const [notice, setNotice] = useState('')
  const publishGoal = action(async (event) => {
    event.preventDefault()
    await hrStore.addPerformanceGoal({ ...goal, progress: Number(goal.progress) })
    setGoal({ employeeId: '', title: '', target: '', dueDate: '', progress: 0 })
    setNotice('Performance goal saved.')
  })
  const publishReview = action(async (event) => {
    event.preventDefault()
    await hrStore.addPerformanceReview({ ...review, rating: Number(review.rating) })
    setReview({ employeeId: '', period: '', rating: '', comments: '' })
    setNotice('Performance review saved.')
  })
  function employeeField(value, onChange) {
    return <Field label="Employee" required><select required value={value} onChange={onChange}><option value="">Choose employee</option>{(state.workspacePeople ?? []).map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></Field>
  }
  return <div style={{ display: 'grid', gap: '18px' }}>
    <PageHeader eyebrow="People Development" title="Performance & Recognition" description="Actual saved goals, performance reviews, and peer recognition. No default ratings or appraisal cycles." />
    {notice && <p role="status">{notice}</p>}
    {management && <div className="dashboard-grid">
      <form className="panel" onSubmit={publishGoal} style={{ padding: '16px', display: 'grid', gap: '10px' }}>
        <h3>Create performance goal</h3>
        {employeeField(goal.employeeId, (event) => setGoal({ ...goal, employeeId: event.target.value }))}
        {['title', 'target', 'dueDate', 'progress'].map((key) => <Field label={key} key={key} required><input type={key === 'dueDate' ? 'date' : key === 'progress' ? 'number' : 'text'} min={0} max={100} required value={goal[key]} onChange={(event) => setGoal({ ...goal, [key]: event.target.value })} /></Field>)}
        <Button type="submit">Save goal</Button>
      </form>
      <form className="panel" onSubmit={publishReview} style={{ padding: '16px', display: 'grid', gap: '10px' }}>
        <h3>Record performance review</h3>
        {employeeField(review.employeeId, (event) => setReview({ ...review, employeeId: event.target.value }))}
        {['period', 'rating', 'comments'].map((key) => <Field label={key} key={key} required><input type={key === 'rating' ? 'number' : 'text'} min={1} max={5} step={0.1} required value={review[key]} onChange={(event) => setReview({ ...review, [key]: event.target.value })} /></Field>)}
        <Button type="submit">Save review</Button>
      </form>
    </div>}
    <DataTable caption="Performance goals" columns={[{ key: 'employeeName', label: 'Employee' }, { key: 'title', label: 'Goal' }, { key: 'target', label: 'Target' }, { key: 'dueDate', label: 'Due' }, { key: 'progress', label: 'Progress', render: (record) => management ? <input aria-label={`Progress for ${record.title}`} type="number" min={0} max={100} defaultValue={record.progress} key={`${record.id}-${record.progress}`} onBlur={action((event) => Number(event.target.value) === record.progress ? undefined : hrStore.updatePerformanceGoal(record.id, Number(event.target.value)))} /> : `${record.progress}%` }]} rows={state.performanceGoals ?? []} />
    <DataTable caption="Performance reviews" columns={[{ key: 'employeeName', label: 'Employee' }, { key: 'period', label: 'Period' }, { key: 'rating', label: 'Rating / 5' }, { key: 'comments', label: 'Review' }, { key: 'reviewerName', label: 'Reviewer' }]} rows={state.performanceReviews ?? []} />
    <DataTable caption="Peer recognition" columns={[{ key: 'from', label: 'From' }, { key: 'to', label: 'Recipient' }, { key: 'badge', label: 'Recognition' }, { key: 'message', label: 'Message' }, { key: 'date', label: 'Date' }]} rows={state.kudos ?? []} />
  </div>
}

export function WorkspaceReports() {
  const state = useWorkspaceState()
  const [activeTab, setActiveTab] = useState('dailyReports') // 'dailyReports' | 'expenses'
  const [searchTerm, setSearchTerm] = useState('')
  const [expenseFilter, setExpenseFilter] = useState('all') // 'all' | 'submitted' | 'approved' | 'rejected'
  const [notice, setNotice] = useState('')
  const [viewingReceiptModal, setViewingReceiptModal] = useState(null)

  const showNotice = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 4000)
  }

  const dailyReports = state.dailyReports ?? []
  const expenses = state.expenses ?? []

  const totalReports = dailyReports.length
  const totalHours = dailyReports.reduce((sum, r) => sum + (Number(r.hoursLogged) || 0), 0)
  const totalClaimed = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const pendingClaims = expenses.filter((e) => (e.status || 'submitted') === 'submitted').length
  const pendingAmount = expenses.filter((e) => (e.status || 'submitted') === 'submitted').reduce((sum, e) => sum + (Number(e.amount) || 0), 0)

  const filteredReports = dailyReports.filter((r) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchEmp = (r.employeeName || '').toLowerCase().includes(q)
      const matchSummary = (r.tasksSummary || r.summary || '').toLowerCase().includes(q)
      const matchChallenges = (r.challenges || '').toLowerCase().includes(q)
      const matchDate = (r.date || '').toLowerCase().includes(q)
      if (!matchEmp && !matchSummary && !matchChallenges && !matchDate) return false
    }
    return true
  })

  const filteredExpenses = expenses.filter((e) => {
    const s = (e.status || 'submitted').toLowerCase()
    if (expenseFilter === 'submitted' && s !== 'submitted') return false
    if (expenseFilter === 'approved' && s !== 'approved' && s !== 'reimbursed') return false
    if (expenseFilter === 'rejected' && s !== 'rejected') return false

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      const matchEmp = (e.employeeName || '').toLowerCase().includes(q)
      const matchMerchant = (e.merchant || '').toLowerCase().includes(q)
      const matchCategory = (e.category || '').toLowerCase().includes(q)
      const matchNotes = (e.comments || e.notes || '').toLowerCase().includes(q)
      if (!matchEmp && !matchMerchant && !matchCategory && !matchNotes) return false
    }
    return true
  })

  const handleDeleteDailyReport = action(async (id) => {
    if (!window.confirm('Are you sure you want to delete this daily work report entry? This cannot be undone.')) return
    await hrStore.deleteDailyReport(id)
    showNotice('Daily work report deleted successfully.')
  })

  const handleDeleteExpense = action(async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense claim? This cannot be undone.')) return
    await hrStore.deleteExpense(id)
    showNotice('Expense claim record deleted successfully.')
  })

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Workforce Reports & Compliance"
        title="Daily Reports & Expense Review"
        description="Review actual submitted work logs, task accomplishments, blockers, and process staff reimbursement claims."
      />

      {notice && (
        <div style={{ padding: '11px 16px', background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7', borderRadius: '8px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={15} />
          <span style={{ flex: 1 }}>{notice}</span>
          <button type="button" onClick={() => setNotice('')} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--teal)', fontSize: '13px' }}>✕</button>
        </div>
      )}

      {/* KPI METRICS */}
      <section className="metric-grid">
        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eef2f6', color: 'var(--blue)' }}>
            <FileText size={20} />
          </div>
          <div className="metric-copy">
            <span>Daily Reports</span>
            <strong>{totalReports} Submissions</strong>
            <small>Across active departments</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
            <Clock3 size={20} />
          </div>
          <div className="metric-copy">
            <span>Workforce Hours Logged</span>
            <strong>{totalHours} hrs</strong>
            <small>Logged productive time</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#fbf3e6', color: '#b97926' }}>
            <Receipt size={20} />
          </div>
          <div className="metric-copy">
            <span>Claims Awaiting Audit</span>
            <strong>{pendingClaims} Claims ({formatINR(pendingAmount)})</strong>
            <small>Ready for review</small>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon" style={{ background: '#faf9f5', color: 'var(--ink)' }}>
            <TrendingUp size={20} />
          </div>
          <div className="metric-copy">
            <span>Total Claims Value</span>
            <strong>{formatINR(totalClaimed)}</strong>
            <small>{expenses.length} claims submitted</small>
          </div>
        </div>
      </section>

      {/* SUBNAV TABS */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--line)', paddingBottom: '2px' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('dailyReports'); setSearchTerm('') }}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'dailyReports' ? 'var(--teal)' : 'var(--muted)',
            borderBottom: activeTab === 'dailyReports' ? '3px solid var(--teal)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={15} />
          <span>Daily Work Reports ({dailyReports.length})</span>
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('expenses'); setSearchTerm('') }}
          style={{
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 700,
            border: 0,
            background: 'transparent',
            cursor: 'pointer',
            color: activeTab === 'expenses' ? 'var(--teal)' : 'var(--muted)',
            borderBottom: activeTab === 'expenses' ? '3px solid var(--teal)' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Receipt size={15} />
          <span>Expense Claims Review ({expenses.length})</span>
        </button>
      </div>

      {/* TAB 1: DAILY WORK REPORTS */}
      {activeTab === 'dailyReports' && (
        <section className="panel">
          <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p className="section-kicker">Operational Logs</p>
              <h2>Submitted Daily Work Reports</h2>
            </div>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--muted)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Search employee, tasks, date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '220px', paddingLeft: '28px', fontSize: '11.5px', height: '32px' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Tasks Summary</th>
                  <th>Blockers / Challenges</th>
                  <th>Tomorrow's Plan</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                      <FileText size={28} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>No daily work reports found</strong>
                      <span style={{ fontSize: '11.5px' }}>Team reports will appear here as employees log their daily progress.</span>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r, idx) => (
                    <tr key={r.id || r._id || idx}>
                      <td>
                        <strong style={{ color: 'var(--ink)', display: 'block' }}>{r.employeeName || 'Staff'}</strong>
                        <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{r.employeeId}</span>
                      </td>
                      <td>{r.date ? new Date(r.date).toLocaleDateString() : 'Recent'}</td>
                      <td>
                        <span className="role-badge" style={{ fontSize: '10px', background: 'var(--soft-teal)', color: 'var(--teal)', fontWeight: 700 }}>
                          {r.hoursLogged || 8} hrs
                        </span>
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--ink)', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>
                          {r.tasksSummary || r.summary}
                        </p>
                      </td>
                      <td>
                        {r.challenges && r.challenges.toLowerCase() !== 'none' && r.challenges.trim() ? (
                          <span style={{ background: '#fef3e2', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, display: 'inline-block' }}>
                            {r.challenges}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>None reported</span>
                        )}
                      </td>
                      <td style={{ maxWidth: '200px', fontSize: '11.5px', color: 'var(--ink)' }}>
                        {r.tomorrowPlan || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => handleDeleteDailyReport(r.id || r._id)}
                          title="Delete Report Record"
                          style={{
                            color: 'var(--coral)',
                            background: 'rgba(220, 38, 38, 0.08)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            border: 0,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                          }}
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 2: EXPENSE CLAIMS REVIEW */}
      {activeTab === 'expenses' && (
        <section className="panel">
          <div className="panel-heading" style={{ flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <p className="section-kicker">Reimbursements Queue</p>
              <h2>Expense Claims for Audit & Approval</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--muted)' }} />
                <input
                  type="text"
                  className="text-input"
                  placeholder="Search employee, merchant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '190px', paddingLeft: '28px', fontSize: '11.5px', height: '32px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'submitted', label: 'Pending' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'rejected', label: 'Rejected' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setExpenseFilter(tab.key)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: 0,
                      cursor: 'pointer',
                      background: expenseFilter === tab.key ? '#fff' : 'transparent',
                      color: expenseFilter === tab.key ? 'var(--teal)' : 'var(--muted)',
                      boxShadow: expenseFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', overflowX: 'auto' }}>
            <table className="ui-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Justification / Notes</th>
                  <th>Proof / Receipt</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Review Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                      <Receipt size={28} style={{ opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
                      <strong style={{ fontSize: '13px', display: 'block', color: 'var(--ink)' }}>No expense claims found</strong>
                      <span style={{ fontSize: '11.5px' }}>Submitted employee claims will appear here for audit.</span>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e, idx) => {
                    const s = (e.status || 'submitted').toLowerCase()
                    return (
                      <tr key={e.id || idx}>
                        <td>
                          <strong style={{ color: 'var(--ink)', display: 'block' }}>{e.employeeName || 'Employee'}</strong>
                          <span style={{ fontSize: '10.5px', color: 'var(--muted)' }}>{e.employeeId}</span>
                        </td>
                        <td>{e.date ? new Date(e.date).toLocaleDateString() : 'Recent'}</td>
                        <td>
                          <span className="role-badge" style={{ fontSize: '9.5px' }}>
                            {e.category || 'General'}
                          </span>
                        </td>
                        <td><strong style={{ color: 'var(--ink)' }}>{e.merchant || '—'}</strong></td>
                        <td><strong style={{ fontSize: '13px', color: 'var(--teal)' }}>{formatINR(e.amount)}</strong></td>
                        <td style={{ maxWidth: '200px', fontSize: '11.5px', color: 'var(--ink)' }} title={e.comments || e.notes}>
                          {e.comments || e.notes || '—'}
                          {e.rejectionReason && (
                            <span style={{ display: 'block', color: '#dc2626', fontSize: '10px', marginTop: '2px' }}>
                              Reason: {e.rejectionReason}
                            </span>
                          )}
                        </td>
                        <td>
                          {e.attachmentUrl ? (
                            <button
                              type="button"
                              onClick={() => setViewingReceiptModal(e)}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                background: '#eaf4f1',
                                border: '1px solid #c7ded7',
                                color: 'var(--teal)',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              <Paperclip size={12} />
                              <span>View Proof</span>
                            </button>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>No proof</span>
                          )}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: s === 'approved' || s === 'reimbursed' ? '#eaf4f1' : s === 'rejected' ? '#fdf2f2' : '#fef3e2',
                              color: s === 'approved' || s === 'reimbursed' ? 'var(--teal)' : s === 'rejected' ? '#dc2626' : '#b45309',
                            }}
                          >
                            {s === 'submitted' ? 'pending review' : s}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {s === 'submitted' && (
                              <>
                                <button
                                  type="button"
                                  className="ui-button primary"
                                  onClick={action(async () => {
                                    await hrStore.approveExpense(e.id)
                                    showNotice(`Approved claim for ${e.employeeName} (${formatINR(e.amount)})`)
                                  })}
                                  style={{ padding: '3px 8px', fontSize: '11px', height: '26px' }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="ui-button secondary"
                                  onClick={action(async () => {
                                    const reason = globalThis.prompt('Reason for rejecting this claim:')
                                    if (reason?.trim()) {
                                      await hrStore.rejectExpense(e.id, undefined, reason.trim())
                                      showNotice(`Rejected claim for ${e.employeeName}`)
                                    }
                                  })}
                                  style={{ padding: '3px 8px', fontSize: '11px', height: '26px' }}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="icon-button"
                              onClick={() => handleDeleteExpense(e.id)}
                              title="Delete Expense Record"
                              style={{
                                color: 'var(--coral)',
                                background: 'rgba(220, 38, 38, 0.08)',
                                borderRadius: '6px',
                                padding: '4px 7px',
                                border: 0,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '11px',
                              }}
                            >
                              <Trash2 size={13} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* RECEIPT / PROOF PREVIEW MODAL */}
      {viewingReceiptModal && (
        <div className="payslip-voucher-overlay" onClick={() => setViewingReceiptModal(null)}>
          <div className="payslip-voucher" style={{ maxWidth: '640px', width: '92%' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-premium">
              <div className="modal-title-group">
                <div className="modal-icon-badge" style={{ background: '#eaf4f1', color: 'var(--teal)' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="modal-title-text">Proof of Expense: {viewingReceiptModal.merchant || viewingReceiptModal.category}</h3>
                  <p className="modal-subtitle-text">
                    Claimed by {viewingReceiptModal.employeeName} ({viewingReceiptModal.employeeId}) • {formatINR(viewingReceiptModal.amount)}
                  </p>
                </div>
              </div>
              <button type="button" className="icon-button" onClick={() => setViewingReceiptModal(null)} aria-label="Close modal">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body-premium" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '12px' }}>
                <div>
                  <strong>File: </strong> {viewingReceiptModal.attachmentName || 'Receipt Document'}
                  {viewingReceiptModal.attachmentSize && <span style={{ color: 'var(--muted)', marginLeft: '6px' }}>({viewingReceiptModal.attachmentSize})</span>}
                </div>
                <a
                  href={viewingReceiptModal.attachmentUrl}
                  download={viewingReceiptModal.attachmentName || 'expense_receipt'}
                  target="_blank"
                  rel="noreferrer"
                  className="ui-button secondary"
                  style={{ padding: '4px 10px', fontSize: '11.5px', height: '28px', textDecoration: 'none' }}
                >
                  Open Full Size
                </a>
              </div>

              {/* PREVIEW CONTAINER */}
              <div style={{ textAlign: 'center', background: '#f1f5f9', borderRadius: '8px', padding: '12px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {viewingReceiptModal.attachmentType?.includes('pdf') || viewingReceiptModal.attachmentUrl?.startsWith('data:application/pdf') ? (
                  <iframe
                    src={viewingReceiptModal.attachmentUrl}
                    title="Receipt PDF"
                    style={{ width: '100%', height: '480px', border: 0, borderRadius: '6px' }}
                  />
                ) : (
                  <img
                    src={viewingReceiptModal.attachmentUrl}
                    alt="Expense Proof"
                    style={{ maxWidth: '100%', maxHeight: '480px', objectFit: 'contain', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                )}
              </div>

              {viewingReceiptModal.comments && (
                <div style={{ marginTop: '14px', padding: '10px 12px', background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '12px' }}>
                  <strong style={{ display: 'block', color: 'var(--muted)', fontSize: '10.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Justification / Notes</strong>
                  <span>{viewingReceiptModal.comments || viewingReceiptModal.notes}</span>
                </div>
              )}
            </div>
            <div className="modal-footer-premium" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" className="ui-button secondary" onClick={() => setViewingReceiptModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function WorkspaceNotifications() {
  const state = useWorkspaceState()
  const { user } = useAuth()
  const notifications = hrStore.getUserNotifications ? hrStore.getUserNotifications(user) : (state.notifications ?? [])
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [feedback, setFeedback] = useState('')

  const portal = user?.role === 'admin' ? 'admin' : (user?.role === 'hr' ? 'hr' : 'employee')

  const showNotice = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 3500)
  }

  const unreadCount = notifications.filter((n) => !n.read).length
  const announcementCount = notifications.filter((n) => n.type === 'announcement').length
  const salaryCount = notifications.filter((n) => n.type === 'salary').length
  const approvalCount = notifications.filter((n) => n.type === 'onboarding' || n.type === 'onboarding_submitted' || n.type === 'onboarding_verified').length
  const leaveCount = notifications.filter((n) => n.type === 'leave' || n.type === 'leave_hr').length
  const expenseCount = notifications.filter((n) => n.type === 'expense' || n.type === 'expenses').length
  const ticketCount = notifications.filter((n) => n.type === 'ticket' || n.type === 'tickets' || n.type === 'helpdesk').length

  const filtered = notifications.filter((n) => {
    if (filterType === 'unread' && n.read) return false
    if (filterType === 'announcement' && n.type !== 'announcement') return false
    if (filterType === 'salary' && n.type !== 'salary') return false
    if (filterType === 'approval' && !['onboarding', 'onboarding_submitted', 'onboarding_verified'].includes(n.type)) return false
    if (filterType === 'leave' && n.type !== 'leave' && n.type !== 'leave_hr') return false
    if (filterType === 'expense' && n.type !== 'expense' && n.type !== 'expenses') return false
    if (filterType === 'ticket' && n.type !== 'ticket' && n.type !== 'tickets' && n.type !== 'helpdesk') return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        (n.title && n.title.toLowerCase().includes(q)) ||
        (n.message && n.message.toLowerCase().includes(q))
      )
    }
    return true
  })

  const getTargetUrl = (n) => {
    if (n.type === 'salary') return portal === 'employee' ? '#/employee/salary' : `#/${portal}/payroll`
    if (n.type === 'announcement') return `#/${portal}/announcements`
    if (n.type === 'onboarding' || n.type === 'onboarding_submitted') return `#/${portal}/people`
    if (n.type === 'leave') return `#/${portal}/leave`
    if (n.type === 'expense' || n.type === 'expenses') return portal === 'employee' ? '#/employee/expenses' : (portal === 'admin' ? '#/admin/reports' : '#/hr/reports')
    if (n.type === 'ticket' || n.type === 'tickets' || n.type === 'helpdesk') return `#/${portal}/helpdesk`
    return null
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'salary':
        return <WalletCards size={18} style={{ color: '#0284c7' }} />
      case 'announcement':
        return <Megaphone size={18} style={{ color: '#ea580c' }} />
      case 'onboarding':
      case 'onboarding_submitted':
      case 'onboarding_verified':
        return <ShieldCheck size={18} style={{ color: '#16a34a' }} />
      case 'leave':
      case 'leave_hr':
        return <CalendarDays size={18} style={{ color: '#9333ea' }} />
      case 'expense':
      case 'expenses':
        return <Receipt size={18} style={{ color: '#d97706' }} />
      case 'ticket':
      case 'tickets':
      case 'helpdesk':
        return <LifeBuoy size={18} style={{ color: '#4f46e5' }} />
      default:
        return <Bell size={18} style={{ color: 'var(--teal)' }} />
    }
  }

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      <PageHeader
        eyebrow="Communication Center"
        title="Notifications & System Alerts"
        description="Stay updated with official broadcasts, salary disbursements, leave requests, document approvals, expense claims, and support tickets."
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="secondary"
            onClick={action(() => {
              hrStore.markAllNotificationsRead()
              showNotice('All notifications marked as read.')
            })}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 size={14} /> Mark all read
          </Button>
          <Button
            variant="danger"
            onClick={action(() => {
              if (window.confirm('Are you sure you want to clear all notifications?')) {
                hrStore.clearAllNotifications()
                showNotice('All notifications cleared.')
              }
            })}
            disabled={notifications.length === 0}
          >
            <Trash2 size={14} /> Clear All
          </Button>
        </div>
      </PageHeader>

      {/* Action Notice */}
      {feedback && (
        <div style={{ padding: '10px 14px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
          {feedback}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="panel" style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${notifications.length})` },
            { key: 'unread', label: `Unread (${unreadCount})` },
            { key: 'expense', label: `Expense Claims (${expenseCount})` },
            { key: 'ticket', label: `Help Desk (${ticketCount})` },
            { key: 'announcement', label: `Announcements (${announcementCount})` },
            { key: 'salary', label: `Salary & Payroll (${salaryCount})` },
            { key: 'approval', label: `Approvals (${approvalCount})` },
            { key: 'leave', label: `Leave (${leaveCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterType(tab.key)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: filterType === tab.key ? 700 : 500,
                borderRadius: '6px',
                border: 0,
                background: filterType === tab.key ? 'var(--teal)' : '#f1f5f9',
                color: filterType === tab.key ? '#fff' : '#475569',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: 'min(100%, 260px)' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Search alerts & updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '11px', border: '1px solid var(--border)', borderRadius: '6px' }}
          />
        </div>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', border: '1px dashed var(--line)', borderRadius: '12px' }}>
            <Bell size={40} style={{ color: 'var(--muted)', margin: '0 auto 12px', opacity: 0.6 }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>No notifications found</h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              {searchQuery ? 'No alerts matched your search query.' : 'You have no notifications in this category.'}
            </p>
          </div>
        ) : (
          filtered.map((item) => {
            const targetUrl = getTargetUrl(item)
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  background: item.read ? '#ffffff' : '#f0fdf4',
                  border: item.read ? '1px solid var(--line)' : '1px solid #bbf7d0',
                  borderRadius: '10px',
                  gap: '14px',
                  transition: 'all 0.15s ease',
                  boxShadow: item.read ? 'none' : '0 1px 4px rgba(22, 163, 74, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: item.read ? '#f8fafc' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{item.title}</strong>
                      {!item.read && (
                        <span style={{ background: '#16a34a', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '1px 6px', borderRadius: '10px' }}>
                          NEW
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>
                        {item.time}
                      </span>
                    </div>

                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#334155', lineHeight: 1.45 }}>
                      {item.message}
                    </p>

                    {targetUrl && (
                      <div style={{ marginTop: '8px' }}>
                        <a
                          href={targetUrl}
                          onClick={action(() => hrStore.markNotificationRead(item.id))}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            color: 'var(--teal)',
                            textDecoration: 'none',
                          }}
                        >
                          View Related Record <ExternalLink size={11} />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={action(() => {
                      hrStore.toggleNotificationRead(item.id)
                      showNotice(item.read ? 'Marked alert as unread.' : 'Marked alert as read.')
                    })}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.read ? 'Mark Unread' : 'Mark Read'}
                  </button>

                  <button
                    type="button"
                    title="Delete alert"
                    onClick={action(() => {
                      hrStore.deleteNotification(item.id)
                      showNotice('Notification removed.')
                    })}
                    style={{
                      background: 'transparent',
                      border: 0,
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
