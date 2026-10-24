import { useState, useRef, useEffect } from 'react'
import { Bot, ChevronDown, MessageSquare, Send, Sparkles, User, X, CheckCircle2, ShieldAlert, ShieldCheck, Activity } from 'lucide-react'
import { hrStore } from '../services/hrStore'
import { useAuth } from '../auth/AuthContext'

export function AIHRAssistant({ isOpen, onClose }) {
  const { user } = useAuth()
  const chatEndRef = useRef(null)

  const isAdmin = user?.role === 'admin'
  const isHR = user?.role === 'hr'
  const isManager = user?.role === 'manager'
  const isEmployee = user?.role === 'employee' || (!isAdmin && !isHR && !isManager)

  const copilotTitle = isAdmin
    ? 'Edufyi AI Admin Copilot'
    : isHR
    ? 'Edufyi AI HR Copilot'
    : 'Edufyi AI Workplace Copilot'

  const copilotSubtitle = isAdmin
    ? 'Grounded in system telemetry, security audit logs & administration'
    : isHR
    ? 'Grounded in workforce records, payroll & approvals'
    : 'Grounded in personal attendance, leaves & compensation policies'

  const getInitialGreeting = () => {
    if (isAdmin) {
      return `Hello Admin! I am your Edufyi AI Admin Copilot. You can ask me about system health & telemetry, user accounts & roles, security audit logs, database maintenance, or configuration parameters.`
    }
    if (isHR) {
      return `Hello HR! I am your Edufyi AI HR Copilot. You can ask me about workforce analytics, pending leave approvals, September payroll run, performance deductions, or recruitment pipeline.`
    }
    const firstName = user?.displayName?.split(' ')[0] ?? 'there'
    return `Hello ${firstName}! I am your Edufyi AI Workplace Copilot. You can ask me about your leave balances, Wi-Fi punch-in rules, salary details, holiday calendar, or submit requests.`
  }

  const [messages, setMessages] = useState(() => [
    {
      id: 'm-1',
      sender: 'ai',
      text: getInitialGreeting(),
      time: 'Just now',
    },
  ])

  // Reset greeting if user changes
  useEffect(() => {
    setMessages([
      {
        id: `m-${Date.now()}`,
        sender: 'ai',
        text: getInitialGreeting(),
        time: 'Just now',
      },
    ])
  }, [user?.role, user?.displayName])

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const storeState = hrStore.getState()
  const companySettings = storeState.companySettings

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  function handleSend(textToSend) {
    const query = (textToSend || input).trim()
    if (!query) return

    const userMsg = { id: `m-${Date.now()}`, sender: 'user', text: query, time: 'Just now' }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const responseText = generateAIResponse(query, user, storeState)
      setMessages((prev) => [
        ...prev,
        { id: `m-${Date.now() + 1}`, sender: 'ai', text: responseText, time: 'Just now' },
      ])
      setIsTyping(false)
    }, 550)
  }

  function generateAIResponse(query, currentUser, state) {
    const q = query.toLowerCase()

    // ADMIN QUERIES
    if (currentUser?.role === 'admin') {
      if (q.includes('health') || q.includes('uptime') || q.includes('status') || q.includes('server')) {
        return `System Telemetry & Operational Health Status:
• Backend Node API (Port 4001): Healthy (HTTP 200 OK, latency < 12ms)
• Frontend React App (Port 5173): Operational (Vite HMR sync active)
• Database Engine: In-Memory / MongoDB operational
• Security Engine: RBAC role isolation active across Admin, HR, and ESS
• Historical Platform SLA: 99.98% uptime`
      }

      if (q.includes('user') || q.includes('role') || q.includes('account') || q.includes('permission')) {
        return `Active User Accounts & RBAC Matrix:
• System Administrators: 1 (Full platform governance & configuration)
• People Operations (HR): 1 (Workforce, attendance & payroll operations)
• Engineering Managers: 1 (Team leave approvals & appraisal reviews)
• Staff & Employees: 6+ (Self-service portal access)
Role separation: Strictly isolated portals with automatic routing guards.`
      }

      if (q.includes('audit') || q.includes('security') || q.includes('log')) {
        return `Security Audit & Telemetry Overview:
• Total Administrative Events: ${state.auditLogs?.length || 24} events logged
• Recent events include payroll record updates, role enforcement checks, and credential validations.
• Complete real-time activity trail is viewable under "Role & Access" and "User Management".`
      }

      if (q.includes('backup') || q.includes('database') || q.includes('maintenance') || q.includes('restore')) {
        return `Database Maintenance & Integrity Status:
• Active JSON database collections: Users, Employees, Leaves, Payroll, Attendance, Tasks, Holidays.
• 1-Click JSON export and instant database snapshot restore available under "System Maintenance".
• All transactional mutations are verified against data schema constraints.`
      }

      if (q.includes('setting') || q.includes('config') || q.includes('parameter')) {
        return `System Configuration Summary:
• Office Locations: Koramangala Hub, Indiranagar Design Studio, SF Bay Area
• Authorized Wi-Fi SSIDs: Edufyi-HQ-Secure, Edufyi-5G-Office
• Working Hours: 09:30 AM to 06:30 PM (15-min arrival grace period)
• Modify global rules in "System Configuration".`
      }
    }

    // HR QUERIES
    if (currentUser?.role === 'hr') {
      if (q.includes('payroll') || q.includes('salary') || q.includes('deduction') || q.includes('disburse')) {
        return `HR Payroll & Performance Deductions Overview:
• Total Payroll Records: ${state.payroll?.length || 8} employee records for September 2026
• Statutory Deductions: EPF (12% of basic), Professional Tax (₹200), and TDS Tax
• Performance / KPI Deductions: Configurable per employee with instant recalculation of total deductions and take-home pay
• Direct Bank Transfers: Prepared for one-click disbursement via NEFT batch runs.`
      }

      if (q.includes('leave') || q.includes('approval') || q.includes('pending')) {
        const pendingCount = (state.leaves || []).filter((l) => l.status === 'pending').length
        return `Workforce Leave Approvals:
• Current Pending Requests: ${pendingCount} leave application(s) awaiting approval
• All pending items can be approved or rejected with required manager notes under "Leave Management".
• Approved leaves automatically synchronize with employee attendance records.`
      }

      if (q.includes('headcount') || q.includes('employee') || q.includes('people') || q.includes('department')) {
        const total = state.employees?.length || 8
        return `Company Workforce Headcount:
• Total Registered Employees: ${total}
• Departments: Engineering, People Operations, Product, Executive, QA
• Status: 100% active with verified bank and tax documentation.`
      }

      if (q.includes('recruit') || q.includes('hiring') || q.includes('candidate')) {
        return `Recruitment Pipeline:
• Open Requisitions: 4 active job postings (Frontend Lead, Product Designer, DevOps)
• Total Candidates in Pipeline: 12 in technical screening & HR interview rounds.`
      }
    }

    // EMPLOYEE / WORKPLACE COMMON QUERIES
    if (q.includes('leave') || q.includes('vacation') || q.includes('day off')) {
      const myLeaves = (state.leaves || []).filter((l) => l.employeeId === currentUser?.employeeId)
      const approvedCount = myLeaves.filter((l) => l.status === 'approved').reduce((acc, curr) => acc + (curr.days || 1), 0)
      return `According to Edufyi HR policy, your current leave quotas are:
• Casual Leave: 8 of 12 remaining
• Sick Leave: 6 of 10 remaining
• Earned / Privilege Leave: 12 of 15 remaining
• Compensatory Off: 2 remaining

You have taken ${approvedCount} approved day(s) this year. You can apply for leave in the "My Leave" section.`
    }

    if (q.includes('wifi') || q.includes('wi-fi') || q.includes('attendance') || q.includes('check in') || q.includes('punch')) {
      const ssids = state.companySettings?.allowedWifiSSIDs?.join(', ') || 'Edufyi-HQ-Secure'
      const rules = state.companySettings?.attendanceRules || { workStartTime: '09:30', workEndTime: '18:30', gracePeriodMinutes: 15 }
      return `Edufyi Smart Attendance Rules:
• Standard office timings: ${rules.workStartTime} AM to ${rules.workEndTime} PM.
• Grace period: ${rules.gracePeriodMinutes} minutes (arrival before 09:45 AM is marked Present).
• Verified Office Wi-Fi SSIDs: ${ssids}.
• Connecting to these networks automatically verifies your physical presence!
• For remote days, you can check-in using the "Remote Check-In" mode.`
    }

    if (q.includes('salary') || q.includes('payslip') || q.includes('credited') || q.includes('pf')) {
      return `Salary & Payroll Information:
• Salaries are disbursed on the final working day of every calendar month directly to your registered bank account.
• September payslips have been generated with full breakdown (Basic, HRA, Allowances, PF 12%, PT, and performance adjustments).
• You can preview and download your official PDF Payslip in "My Salary & Payslip".`
    }

    if (q.includes('holiday') || q.includes('diwali') || q.includes('gandhi') || q.includes('off')) {
      const nextHolidays = (state.holidays || []).slice(0, 3)
      return `Upcoming official company holidays:
${nextHolidays.map((h) => `• ${h.name} (${h.date}, ${h.day}) - ${h.type}`).join('\n')}

Offices will remain closed, and all critical support follows on-call rosters.`
    }

    if (q.includes('insurance') || q.includes('medical') || q.includes('claim') || q.includes('hospital')) {
      return `Group Health & Medical Benefits:
• Edufyi provides comprehensive health insurance coverage up to INR 5,00,000 for employees and immediate dependents.
• Cashless hospitalization is supported across 6,500+ network hospitals.
• For reimbursement claims, submit medical bills under "Expense Claims" with discharge summary.`
    }

    if (q.includes('help') || q.includes('ticket') || q.includes('laptop') || q.includes('support')) {
      return `Need assistance? You can open a ticket in the "Support Help Desk" for:
• IT & Hardware support (MacBooks, monitors, VPN access)
• HR Operations & Employment letters
• Payroll, PF, and Tax queries
• Average SLA resolution time is under 4 business hours.`
    }

    // Role-tailored fallback response
    if (currentUser?.role === 'admin') {
      return `I can assist you with platform administration! Here are quick topics:
1. "Check system health & uptime"
2. "Summary of active user roles"
3. "Recent security audit logs"
4. "Database backup status"
5. "System configuration parameters"

Click any suggestion or type your administrative request.`
    }

    if (currentUser?.role === 'hr') {
      return `I can assist with People Operations! Here are quick topics:
1. "September payroll summary"
2. "Pending leave approvals"
3. "Employee headcount by department"
4. "Performance deduction policy"
5. "Recruitment pipeline status"

Click any suggestion or type your HR query.`
    }

    return `I can help you with your workspace questions! Here are key areas:
1. "How many leaves do I have left?"
2. "What is the office Wi-Fi attendance rule?"
3. "When is salary credited?"
4. "Show upcoming company holidays"
5. "How do I raise a support ticket?"

Feel free to click any suggestion below or ask your specific question.`
  }

  const suggestions = isAdmin
    ? [
        'Check system health & uptime',
        'Summary of active user roles',
        'Recent security audit logs',
        'Database backup status',
        'System configuration parameters',
      ]
    : isHR
    ? [
        'September payroll summary',
        'Pending leave approvals',
        'Performance deduction policy',
        'Employee headcount by department',
        'Recruitment pipeline status',
      ]
    : [
        'Check my leave balance',
        'What is the Wi-Fi policy?',
        'When is salary credited?',
        'Upcoming company holidays',
        'How to raise a ticket?',
      ]

  const inputPlaceholder = isAdmin
    ? 'Ask about system health, user roles, security audit logs, backups...'
    : isHR
    ? 'Ask about payroll, performance deductions, leave approvals, headcount...'
    : 'Ask about leaves, Wi-Fi rules, salary, policies, holidays...'

  if (!isOpen) return null

  return (
    <div className="ai-assistant-modal" role="dialog" aria-modal="true" aria-labelledby="copilot-modal-title">
      <div className="ai-assistant-window">
        <header className="ai-assistant-header">
          <div className="ai-header-info">
            <div className="ai-avatar-badge">
              <Bot size={18} />
              <span className="online-indicator" />
            </div>
            <div>
              <strong id="copilot-modal-title">{copilotTitle}</strong>
              <small>{copilotSubtitle}</small>
            </div>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close AI Assistant">
            <X size={18} />
          </button>
        </header>

        <div className="ai-assistant-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`ai-message-row ${msg.sender}`}>
              <div className="ai-message-avatar">
                {msg.sender === 'ai' ? <Bot size={14} /> : <User size={14} />}
              </div>
              <div className="ai-message-content">
                <div className="ai-message-bubble">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '3px 0' }}>{line}</p>
                  ))}
                </div>
                <span className="ai-message-time">{msg.time}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="ai-message-row ai">
              <div className="ai-message-avatar"><Bot size={14} /></div>
              <div className="ai-message-bubble typing-dots">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="ai-suggestion-chips">
          {suggestions.map((chip) => (
            <button
              key={chip}
              type="button"
              className="suggestion-chip"
              onClick={() => handleSend(chip)}
            >
              <Sparkles size={11} /> {chip}
            </button>
          ))}
        </div>

        <form
          className="ai-assistant-input-row"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            type="text"
            placeholder={inputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={!input.trim()} aria-label="Send message">
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  )
}
