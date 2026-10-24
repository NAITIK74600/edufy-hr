import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Network,
  Users,
  Building2,
  ChevronDown,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
  Filter,
  Plus,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  X,
  Edit2,
  Layers,
  Check,
  ExternalLink,
  HelpCircle,
  TrendingUp,
  ArrowDown,
  CheckCircle2,
  Clock,
  Send,
  FileText,
} from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { hasPermission } from '../../auth/permissions'
import { hrStore } from '../../services/hrStore'
import { Button, StatusBadge, Field } from '../ui'

// Role badge styling and metadata matching organizational chart
const ROLE_BADGES = {
  director: { label: 'Director', bg: '#fef3c7', text: '#b45309', border: '#f59e0b', ring: '#fbbf24' },
  manager: { label: 'Manager', bg: '#dbeafe', text: '#1d4ed8', border: '#3b82f6', ring: '#60a5fa' },
  team_lead: { label: 'Team Lead', bg: '#ccfbf1', text: '#0f766e', border: '#14b8a6', ring: '#2dd4bf' },
  employee: { label: 'Employee', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1', ring: '#94a3b8' },
  admin: { label: 'Admin', bg: '#fee2e2', text: '#b91c1c', border: '#ef4444', ring: '#f87171' },
  hr: { label: 'HR', bg: '#d1fae5', text: '#047857', border: '#10b981', ring: '#34d399' },
}

function getRoleBadge(role) {
  return ROLE_BADGES[role] || ROLE_BADGES.employee
}

// Department theme colors for visual grouping
const DEPT_COLORS = {
  'Executive Leadership': { border: '#8b5cf6', badge: '#ede9fe', text: '#6d28d9', dot: '#7c3aed' },
  Executive: { border: '#8b5cf6', badge: '#ede9fe', text: '#6d28d9', dot: '#7c3aed' },
  'Revenue Growth': { border: '#f59e0b', badge: '#fef3c7', text: '#b45309', dot: '#f59e0b' },
  Operations: { border: '#06b6d4', badge: '#cffafe', text: '#0e7490', dot: '#06b6d4' },
  Technology: { border: '#2563eb', badge: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6' },
  'Human Resources': { border: '#10b981', badge: '#d1fae5', text: '#047857', dot: '#10b981' },
}

function getDeptStyle(department) {
  return (
    DEPT_COLORS[department] || {
      border: '#64748b',
      badge: '#f1f5f9',
      text: '#475569',
      dot: '#64748b',
    }
  )
}

function EmployeeAvatar({ name, size = 44, deptStyle }) {
  const initials = String(name ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size >= 40 ? '14px' : '11px',
        backgroundColor: deptStyle?.badge || 'var(--surface-sunken)',
        color: deptStyle?.text || 'var(--foreground)',
        border: `2px solid ${deptStyle?.border || 'var(--border)'}`,
        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
      }}
    >
      {initials}
    </div>
  )
}

// -------------------------------------------------------------
// NODE CARD COMPONENT
// -------------------------------------------------------------
function OrgNodeCard({
  node,
  isSelected,
  isInChain,
  isCollapsed,
  onToggleCollapse,
  onSelect,
}) {
  const deptStyle = getDeptStyle(node.department)
  const hasChildren = node.children && node.children.length > 0

  return (
    <div
      id={`node-${node.id}`}
      onClick={() => onSelect(node)}
      style={{
        width: '280px',
        borderRadius: '12px',
        backgroundColor: 'var(--surface)',
        border: isSelected
          ? `2px solid ${deptStyle.border}`
          : isInChain
          ? '2px dashed #3b82f6'
          : '1px solid var(--border)',
        boxShadow: isSelected
          ? `0 0 0 4px ${deptStyle.badge}, 0 8px 24px rgba(0,0,0,0.12)`
          : '0 4px 12px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        userSelect: 'none',
      }}
      className="org-node-card"
    >
      {/* Top Bar with Department, Role Badge & Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '999px',
              backgroundColor: deptStyle.badge,
              color: deptStyle.text,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            {node.department || 'General'}
          </span>
          {node.role && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: getRoleBadge(node.role).bg,
                color: getRoleBadge(node.role).text,
                border: `1px solid ${getRoleBadge(node.role).border}`,
                letterSpacing: '0.02em',
              }}
            >
              {getRoleBadge(node.role).label}
            </span>
          )}
          {node.team && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: '#f3e8ff',
                color: '#7e22ce',
                border: '1px solid #d8b4fe',
                letterSpacing: '0.02em',
              }}
            >
              {node.team}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: node.status === 'active' ? '#10b981' : '#f59e0b',
            }}
            title={node.status || 'Active'}
          />
          <span style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600 }}>
            {node.status === 'active' ? 'Active' : node.status}
          </span>
        </div>
      </div>

      {/* Main Info Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <EmployeeAvatar name={node.name} deptStyle={deptStyle} size={46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--foreground)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.name}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: '1px',
            }}
          >
            {node.designation || 'Team Member'}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px', fontWeight: 500 }}>
            {node.employeeId}
          </div>
        </div>
      </div>

      {/* Stats & Reporting Team Chips */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border)',
          paddingTop: '8px',
          marginTop: '2px',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)' }}>
          <Users size={12} />
          <span>
            <strong style={{ color: 'var(--foreground)' }}>{node.directReportCount || 0}</strong> direct
          </span>
          <span style={{ color: 'var(--border)' }}>•</span>
          <span>
            <strong style={{ color: 'var(--foreground)' }}>{node.totalTeamCount || 0}</strong> team
          </span>
        </div>

        {hasChildren && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleCollapse(node.id)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 700,
              borderRadius: '6px',
              border: '1px solid var(--border)',
              backgroundColor: isCollapsed ? 'var(--surface-sunken)' : 'var(--surface)',
              color: isCollapsed ? 'var(--primary)' : 'var(--muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title={isCollapsed ? 'Expand direct reports' : 'Collapse direct reports'}
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            <span>{node.children.length}</span>
          </button>
        )}
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// RECURSIVE ORG TREE BRANCH (SOLID CONTINUOUS CONNECTION LINKS)
// -------------------------------------------------------------
function OrgTreeBranch({
  node,
  selectedId,
  chainSet,
  collapsedMap,
  onToggleCollapse,
  onSelect,
}) {
  const isSelected = String(node.id) === String(selectedId)
  const isInChain = chainSet.has(String(node.id))
  const isCollapsed = Boolean(collapsedMap[node.id])
  const hasChildren = node.children && node.children.length > 0 && !isCollapsed

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Node Card */}
      <OrgNodeCard
        node={node}
        isSelected={isSelected}
        isInChain={isInChain}
        isCollapsed={isCollapsed}
        onToggleCollapse={onToggleCollapse}
        onSelect={onSelect}
      />

      {/* Vertical line connector downwards from parent node */}
      {hasChildren && (
        <div
          style={{
            width: '2px',
            height: '24px',
            backgroundColor: isInChain ? '#006e6f' : 'var(--border)',
            transition: 'background-color 0.2s ease',
          }}
        />
      )}

      {/* Children Row with Seamless Segmented Horizontal Bus */}
      {hasChildren && (
        <div style={{ display: 'flex', position: 'relative' }}>
          {node.children.map((child, idx) => {
            const isFirst = idx === 0
            const isLast = idx === node.children.length - 1
            const isSingle = node.children.length === 1
            const childInChain = chainSet.has(String(child.id))

            return (
              <div
                key={child.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  padding: '0 16px',
                }}
              >
                {/* Continuous Horizontal Bus Segments */}
                {!isSingle && (
                  <>
                    {/* Left half segment (connects to left sibling column) */}
                    {!isFirst && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: '50%',
                          height: '2px',
                          backgroundColor: childInChain && isInChain ? '#006e6f' : 'var(--border)',
                        }}
                      />
                    )}
                    {/* Right half segment (connects to right sibling column) */}
                    {!isLast && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: '50%',
                          right: 0,
                          height: '2px',
                          backgroundColor: 'var(--border)',
                        }}
                      />
                    )}
                  </>
                )}

                {/* Vertical stem from horizontal bus line down to child card */}
                <div
                  style={{
                    width: '2px',
                    height: '24px',
                    backgroundColor: childInChain ? '#006e6f' : 'var(--border)',
                    transition: 'background-color 0.2s ease',
                  }}
                />

                <OrgTreeBranch
                  node={child}
                  selectedId={selectedId}
                  chainSet={chainSet}
                  collapsedMap={collapsedMap}
                  onToggleCollapse={onToggleCollapse}
                  onSelect={onSelect}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// CHANGE MANAGER MODAL
// -------------------------------------------------------------
function ChangeManagerModal({ employee, allEmployees, isOpen, onClose, onSave }) {
  const [selectedMgrId, setSelectedMgrId] = useState(employee?.managerId || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelectedMgrId(employee?.managerId || '')
    setError('')
  }, [employee, isOpen])

  if (!isOpen || !employee) return null

  // Check circular reporting for potential managers (Director, Managers, Team Leads, Admin, HR)
  const rolePriority = { director: 1, manager: 2, team_lead: 3, admin: 4, hr: 5 }
  const availableManagers = allEmployees
    .filter((m) => {
      if (m.id === employee.id || m._id === employee.id) return false
      return m.status === 'active' && ['director', 'manager', 'team_lead', 'admin', 'hr'].includes(m.role)
    })
    .sort((a, b) => {
      const pa = rolePriority[a.role] || 99
      const pb = rolePriority[b.role] || 99
      if (pa !== pb) return pa - pb
      return (a.name || '').localeCompare(b.name || '')
    })

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)
    try {
      const val = hrStore.validateManagerAssignment(employee.id, selectedMgrId || null)
      if (!val.valid) {
        setError(val.message)
        return
      }
      await onSave(employee.id, selectedMgrId || null)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: '#0f172a',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Change Reporting Manager</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Reassign reporting line for <strong style={{ color: '#0f172a' }}>{employee.name}</strong> ({employee.designation})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              Select New Reporting Manager
            </label>
            <select
              value={selectedMgrId}
              onChange={(e) => {
                setSelectedMgrId(e.target.value)
                setError('')
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                color: '#0f172a',
              }}
            >
              <option value="">None (Top-Level / Company Root)</option>
              {availableManagers.map((mgr) => {
                const val = hrStore.validateManagerAssignment(employee.id, mgr.id)
                return (
                  <option key={mgr.id} value={mgr.id} disabled={!val.valid}>
                    {mgr.name} — {mgr.designation} ({mgr.department}) {!val.valid ? '(Circular Chain Loop)' : ''}
                  </option>
                )
              })}
            </select>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
              Note: Subordinates in {employee.name}'s reporting line are automatically disabled to prevent circular loops.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ui-button primary"
              style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
            >
              Update Manager
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// TRANSFER DEPARTMENT MODAL
// -------------------------------------------------------------
function TransferDepartmentModal({ employee, allEmployees, isOpen, onClose, onSave }) {
  const [department, setDepartment] = useState(employee?.department || 'Technology')
  const [managerId, setManagerId] = useState(employee?.managerId || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (employee) {
      setDepartment(employee.department || 'Technology')
      setManagerId(employee.managerId || '')
      setError('')
    }
  }, [employee, isOpen])

  if (!isOpen || !employee) return null

  const departments = ['Executive Leadership', 'Revenue Growth', 'Operations', 'Technology', 'Human Resources']

  async function handleSubmit(e) {
    e.preventDefault()
    if (saving) return
    setError('')
    setSaving(true)
    try {
      if (managerId) {
        const val = hrStore.validateManagerAssignment(employee.id, managerId)
        if (!val.valid) {
          setError(val.message)
          return
        }
      }
      await onSave(employee.id, department, managerId || null)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally { setSaving(false) }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.05)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: '#0f172a',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Transfer Department</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Transfer <strong style={{ color: '#0f172a' }}>{employee.name}</strong> to a different department
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              borderRadius: '8px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              Target Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                color: '#0f172a',
              }}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: '#334155' }}>
              New Reporting Manager (Optional)
            </label>
            <select
              value={managerId}
              onChange={(e) => setManagerId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                color: '#0f172a',
              }}
            >
              <option value="">Keep current / None</option>
              {allEmployees
                .filter((m) => m.id !== employee.id && m._id !== employee.id && m.status === 'active' && ['director', 'manager', 'team_lead', 'admin', 'hr'].includes(m.role))
                .sort((a, b) => {
                  const rolePriority = { director: 1, manager: 2, team_lead: 3, admin: 4, hr: 5 }
                  const pa = rolePriority[a.role] || 99
                  const pb = rolePriority[b.role] || 99
                  if (pa !== pb) return pa - pb
                  return (a.name || '').localeCompare(b.name || '')
                })
                .map((mgr) => (
                  <option key={mgr.id} value={mgr.id}>
                    {mgr.name} — {mgr.designation} ({mgr.department})
                  </option>
                ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="ui-button primary"
              style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
            >
              {saving ? 'Saving...' : 'Confirm Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// QUICK ADD EMPLOYEE MODAL (ORG ONBOARDING)
// -------------------------------------------------------------
function QuickAddEmployeeModal({ allEmployees, defaultManagerId, isOpen, onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState('basic') // 'basic' | 'identity' | 'bank' | 'education' | 'family'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Technology',
    managerId: defaultManagerId || '',
    status: 'active',
    location: '',
    employmentType: 'Full-time',
    joiningDate: new Date().toISOString().split('T')[0],
    salary: '0',
    // Identity & Statutory
    aadharNumber: '',
    aadharDoc: '',
    panTaxId: '',
    panDoc: '',
    passportNumber: '',
    passportDoc: '',
    hasExistingUan: false,
    uanNumber: '',
    uanDoc: '',
    // Banking Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    cancelledCheque: '',
    // Education & Marksheets
    ugMarksheets: '',
    pgMarksheets: '',
    degreeCertificates: '',
    // Family & Emergency
    passportPhoto: '',
    fatherName: '',
    motherName: '',
    parentPhone: '',
    parentAddress: '',
    emergencyContactName: '',
    emergencyRelation: '',
    emergencyPhone: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (defaultManagerId) {
      setFormData((prev) => ({ ...prev, managerId: defaultManagerId }))
    }
  }, [defaultManagerId])

  if (!isOpen) return null

  function handleFile(field, e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFormData((prev) => ({ ...prev, [field]: reader.result }))
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!formData.name || !formData.email || !formData.designation) {
      setError('Please provide Name, Work Email, and Designation.')
      return
    }

    try {
      const mgr = allEmployees.find((m) => m.id === formData.managerId || m._id === formData.managerId)
      const newEmp = await hrStore.addEmployee({
        ...formData,
        managerName: mgr ? mgr.name : null,
        salary: Number(formData.salary) || 0,
        bankDetails: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          panTaxId: formData.panTaxId,
          uanNumber: formData.hasExistingUan ? formData.uanNumber : '',
        },
        parentsContact: {
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          phone: formData.parentPhone,
          address: formData.parentAddress,
        },
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyRelation,
          phone: formData.emergencyPhone,
        },
        identity: {
          aadharNumber: formData.aadharNumber,
          panNumber: formData.panTaxId,
          passportNumber: formData.passportNumber,
          hasExistingUan: formData.hasExistingUan,
          uanNumber: formData.hasExistingUan ? formData.uanNumber : '',
        },
        documents: {
          passportPhoto: formData.passportPhoto,
          uanDoc: formData.uanDoc,
          aadharDoc: formData.aadharDoc,
          panDoc: formData.panDoc,
          ugMarksheets: formData.ugMarksheets,
          pgMarksheets: formData.pgMarksheets,
          degreeCertificates: formData.degreeCertificates,
          cancelledCheque: formData.cancelledCheque,
          passportDoc: formData.passportDoc,
        },
      })
      onCreated(newEmp)
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#0f172a',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Add Employee to Organization</h3>
            <small style={{ color: '#64748b', fontSize: '11px' }}>
              Register employee, reporting relationship, statutory IDs & onboarding documents.
            </small>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 0, fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
          >
            ✕
          </button>
        </div>

        {/* TAB BAR */}
        <div style={{ display: 'flex', gap: '4px', background: '#f8fafc', padding: '6px 16px', borderBottom: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {[
            { key: 'basic', label: '1. Basic & Role' },
            { key: 'identity', label: '2. Identity & UAN' },
            { key: 'bank', label: '3. Bank Details' },
            { key: 'education', label: '4. Education & Marksheets' },
            { key: 'family', label: '5. Family & Photo' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: activeTab === t.key ? 700 : 500,
                borderRadius: '6px',
                border: 0,
                background: activeTab === t.key ? '#fff' : 'transparent',
                color: activeTab === t.key ? '#0284c7' : '#64748b',
                boxShadow: activeTab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px 16px', fontSize: '12px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeTab === 'basic' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Miller"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Work Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="jordan.miller@edufyi.local"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Department *</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      {['Executive Leadership', 'Revenue Growth', 'Operations', 'Technology', 'Human Resources'].map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Designation *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Frontend Engineer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Reporting Manager</label>
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">No manager (Top level)</option>
                      {allEmployees.map((m) => (
                        <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Annual CTC (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'identity' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Aadhar Card Number</label>
                    <input
                      type="text"
                      placeholder="12-digit number"
                      value={formData.aadharNumber}
                      onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '6px' }}
                    />
                    <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📎 Upload Aadhar Card</span>
                      <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFile('aadharDoc', e)} style={{ display: 'none' }} />
                      {formData.aadharDoc && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                    </label>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>PAN Card Number</label>
                    <input
                      type="text"
                      placeholder="10-digit PAN"
                      value={formData.panTaxId}
                      onChange={(e) => setFormData({ ...formData, panTaxId: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '6px' }}
                    />
                    <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📎 Upload PAN Card</span>
                      <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFile('panDoc', e)} style={{ display: 'none' }} />
                      {formData.panDoc && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                    </label>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Passport Number</label>
                    <input
                      type="text"
                      placeholder="Passport number"
                      value={formData.passportNumber}
                      onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '6px' }}
                    />
                    <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📎 Upload Passport</span>
                      <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFile('passportDoc', e)} style={{ display: 'none' }} />
                      {formData.passportDoc && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                    </label>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.hasExistingUan}
                        onChange={(e) => setFormData({ ...formData, hasExistingUan: e.target.checked })}
                      />
                      <span>Already has UAN (EPF)?</span>
                    </label>
                    {formData.hasExistingUan && (
                      <>
                        <input
                          type="text"
                          placeholder="12-digit UAN"
                          value={formData.uanNumber}
                          onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                          style={{ width: '100%', padding: '6px 8px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '6px' }}
                        />
                        <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
                          <span>📎 Upload UAN Card / Passbook</span>
                          <input type="file" accept=".pdf,.jpg,.png,image/*" onChange={(e) => handleFile('uanDoc', e)} style={{ display: 'none' }} />
                          {formData.uanDoc && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                        </label>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'bank' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 5010049281923"
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={formData.ifscCode}
                      onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📎 Upload Cancelled Cheque</span>
                      <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFile('cancelledCheque', e)} style={{ display: 'none' }} />
                      {formData.cancelledCheque && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                    </label>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'education' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>UG Marksheets</strong>
                  <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📎 Upload UG Marksheets</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFile('ugMarksheets', e)} style={{ display: 'none' }} />
                    {formData.ugMarksheets && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                  </label>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>PG Marksheets</strong>
                  <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📎 Upload PG Marksheets</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFile('pgMarksheets', e)} style={{ display: 'none' }} />
                    {formData.pgMarksheets && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                  </label>
                </div>

                <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>Degree Certificates</strong>
                  <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📎 Upload Degree Certificates</span>
                    <input type="file" accept=".pdf,.jpg,.png" onChange={(e) => handleFile('degreeCertificates', e)} style={{ display: 'none' }} />
                    {formData.degreeCertificates && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Attached</span>}
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'family' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Passport Photo</label>
                    <label style={{ fontSize: '11px', color: '#0284c7', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📎 Upload Photo</span>
                      <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => handleFile('passportPhoto', e)} style={{ display: 'none' }} />
                      {formData.passportPhoto && <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Photo Attached</span>}
                    </label>
                    {formData.passportPhoto && (
                      <img src={formData.passportPhoto} alt="Passport preview" style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', marginTop: '6px' }} />
                    )}
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Emergency Contact Name</label>
                    <input
                      type="text"
                      placeholder="Contact name"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Father's Name</label>
                    <input
                      type="text"
                      placeholder="Father's name"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Mother's Name</label>
                    <input
                      type="text"
                      placeholder="Mother's name"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Parents Phone</label>
                    <input
                      type="tel"
                      placeholder="+91 98765 11111"
                      value={formData.parentPhone}
                      onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '4px' }}>Parents Address</label>
                    <input
                      type="text"
                      placeholder="Residential address"
                      value={formData.parentAddress}
                      onChange={(e) => setFormData({ ...formData, parentAddress: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 16px', fontSize: '12px', fontWeight: 600, borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ padding: '8px 20px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: 0, background: '#0284c7', color: '#fff', cursor: 'pointer' }}
            >
              Add to Hierarchy
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// -------------------------------------------------------------
// RECURSIVE OUTLINE BRANCH (MOBILE-FRIENDLY HIERARCHY TREE)
// -------------------------------------------------------------
function OrgOutlineBranch({ node, level = 0, selectedId, collapsedMap, onToggleCollapse, onSelect }) {
  const isSelected = String(node.id) === String(selectedId)
  const isCollapsed = Boolean(collapsedMap[node.id])
  const hasChildren = node.children && node.children.length > 0
  const deptStyle = getDeptStyle(node.department)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div
        onClick={() => onSelect(node)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '10px 14px',
          marginLeft: `${Math.min(level * 14, 42)}px`,
          backgroundColor: isSelected ? deptStyle.badge : 'var(--surface)',
          border: isSelected ? `2px solid ${deptStyle.border}` : '1px solid var(--border)',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleCollapse(node.id)
              }}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--surface-sunken)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              title={isCollapsed ? 'Expand reports' : 'Collapse reports'}
            >
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          ) : (
            <div style={{ width: '28px', flexShrink: 0 }} />
          )}
          <EmployeeAvatar name={node.name} size={34} deptStyle={deptStyle} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {node.name}
              </span>
              {node.role && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '5px',
                    backgroundColor: getRoleBadge(node.role).bg,
                    color: getRoleBadge(node.role).text,
                    border: `1px solid ${getRoleBadge(node.role).border}`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {getRoleBadge(node.role).label}
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node.designation} • <span style={{ color: deptStyle.text, fontWeight: 600 }}>{node.department}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {hasChildren && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'var(--surface-sunken)', color: 'var(--muted)' }}>
              {node.children.length} reports
            </span>
          )}
          <ArrowRight size={14} style={{ color: 'var(--muted)' }} />
        </div>
      </div>

      {hasChildren && !isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {node.children.map((child) => (
            <OrgOutlineBranch
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              collapsedMap={collapsedMap}
              onToggleCollapse={onToggleCollapse}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// MAIN ORGANIZATION HIERARCHY PAGE
// -------------------------------------------------------------
export function OrgHierarchyPage() {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(hrStore.getState())
  const [selectedNode, setSelectedNode] = useState(null)
  const [viewMode, setViewMode] = useState('canvas') // 'canvas' | 'outline'
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeViewerId, setActiveViewerId] = useState('') // Admin/HR scope simulation
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [collapsedMap, setCollapsedMap] = useState({})
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [startPan, setStartPan] = useState({ x: 0, y: 0 })
  const [feedback, setFeedback] = useState('')

  // Modals state
  const [changeMgrModalOpen, setChangeMgrModalOpen] = useState(false)
  const [transferDeptModalOpen, setTransferDeptModalOpen] = useState(false)
  const [addEmpModalOpen, setAddEmpModalOpen] = useState(false)

  const canvasRef = useRef(null)

  // Subscribe to real-time changes in hrStore
  useEffect(() => {
    return hrStore.subscribe((state) => {
      setStoreState({ ...state })
    })
  }, [])

  const allEmployees = storeState.employees || []
  const canManageEmployees = user?.role === 'admin' || user?.role === 'hr' || hasPermission(user, 'employees.write')

  // Determine effective viewer for role-based scoping:
  // Non-admin/HR users always see their scoped tree (upward line to Director + squad).
  // Admin and HR see the full tree by default, or can preview as any employee/TL/manager.
  const effectiveViewer = useMemo(() => {
    if (canManageEmployees && activeViewerId) {
      return allEmployees.find((e) => String(e.id || e._id) === activeViewerId || e.employeeId === activeViewerId) || null
    }
    if (user && user.role !== 'admin' && user.role !== 'hr') {
      return user
    }
    return null
  }, [canManageEmployees, activeViewerId, user, allEmployees])

  // Build hierarchy tree based on department filter and viewer scope
  const { roots, stats, scoped, chain, reportingLine, targetEmployee } = useMemo(() => {
    return hrStore.getOrganizationHierarchy(null, departmentFilter || null, effectiveViewer)
  }, [storeState.employees, departmentFilter, effectiveViewer])

  // Get active reporting chain for selected employee
  const reportingChain = useMemo(() => {
    if (!selectedNode) return []
    return hrStore.getEmployeeReportingChain(selectedNode.id)
  }, [selectedNode, storeState.employees])

  const chainSet = useMemo(() => {
    return new Set(reportingChain.map((item) => String(item.id || item._id)))
  }, [reportingChain])

  // Direct reports of selected node
  const directReports = useMemo(() => {
    if (!selectedNode) return []
    return hrStore.getDirectReports(selectedNode.id)
  }, [selectedNode, storeState.employees])

  // Search logic with live auto-complete
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }
    const q = searchQuery.toLowerCase().trim()
    const matches = allEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
        (e.department && e.department.toLowerCase().includes(q))
    )
    setSearchResults(matches.slice(0, 8))
    setSearchOpen(true)
  }, [searchQuery, allEmployees])

  function showNotification(msg) {
    setFeedback(msg)
    setTimeout(() => setFeedback(''), 4500)
  }

  // Handle selecting an employee from search or clicking on node
  const handleSelectEmployee = useCallback((node) => {
    setSelectedNode(node)

    // Expand all ancestors in chain so node is visible
    const chain = hrStore.getEmployeeReportingChain(node.id)
    setCollapsedMap((prev) => {
      const next = { ...prev }
      chain.forEach((c) => {
        delete next[c.id]
      })
      return next
    })
  }, [])

  function handleSearchResultClick(emp) {
    setSearchQuery('')
    setSearchOpen(false)
    handleSelectEmployee(emp)

    // Scroll node into view smoothly
    setTimeout(() => {
      const el = document.getElementById(`node-${emp.id}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }, 150)
  }

  function handleToggleCollapse(nodeId) {
    setCollapsedMap((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }))
  }

  function handleExpandAll() {
    setCollapsedMap({})
    showNotification('Expanded all hierarchy branches.')
  }

  function handleCollapseAll() {
    const next = {}
    allEmployees.forEach((e) => {
      next[e.id] = true
    })
    setCollapsedMap(next)
    showNotification('Collapsed branches to executive root.')
  }

  function handleZoomIn() {
    setZoom((z) => Math.min(1.6, z + 0.15))
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(0.4, z - 0.15))
  }

  function handleResetView() {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  function handleFitScreen() {
    setZoom(0.85)
    setPan({ x: 0, y: 0 })
  }

  // Pan and drag canvas handlers
  function handleMouseDown(e) {
    // Only drag on canvas background, not inside interactive inputs or cards
    if (e.target.closest('.org-node-card') || e.target.closest('button') || e.target.closest('input')) {
      return
    }
    setIsPanning(true)
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  function handleMouseMove(e) {
    if (!isPanning) return
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    })
  }

  function handleMouseUp() {
    setIsPanning(false)
  }

  async function handleSaveManager(employeeId, newManagerId) {
      const updated = await hrStore.updateEmployeeManager(employeeId, newManagerId, user?.displayName || user?.name || 'Admin')
      showNotification(`Successfully updated reporting manager for ${updated.name}.`)
      setSelectedNode(updated)
  }

  async function handleSaveDepartmentTransfer(employeeId, newDepartment, newManagerId) {
      const updated = await hrStore.transferEmployeeDepartment(
        employeeId,
        newDepartment,
        newManagerId,
        user?.displayName || user?.name || 'Admin'
      )
      showNotification(`Transferred ${updated.name} to department ${newDepartment}.`)
      setSelectedNode(updated)
  }

  function handleEmployeeCreated(newEmp) {
    showNotification(`Added ${newEmp.name} to ${newEmp.department} department.`)
    handleSelectEmployee(newEmp)
  }

  const deptStyle = selectedNode ? getDeptStyle(selectedNode.department) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 120px)' }}>
      {/* Feedback Toast */}
      {feedback && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Check size={16} style={{ color: '#10b981' }} />
          <span>{feedback}</span>
        </div>
      )}

      {/* TOP HEADER */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--primary)',
                backgroundColor: 'var(--surface-sunken)',
                padding: '3px 8px',
                borderRadius: '6px',
              }}
            >
              Enterprise Architecture
            </span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0 2px 0', letterSpacing: '-0.02em' }}>
            Organization Hierarchy
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
            Visual organizational reporting structure, reporting lines & department workforce breakdown
          </p>
        </div>

        {/* Quick Metrics & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              padding: '6px 16px',
            }}
          >
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Staff
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800 }}>{stats.totalEmployees || 0}</div>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Departments
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800 }}>{stats.totalDepartments || 0}</div>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Rate
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>
                {stats.totalEmployees ? Math.round((stats.activeEmployees / stats.totalEmployees) * 100) : 100}%
              </div>
            </div>
          </div>

          {canManageEmployees && (
            <button
              type="button"
              className="ui-button primary"
              onClick={() => setAddEmpModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                cursor: 'pointer',
              }}
            >
              <Plus size={16} />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* CONTROLS TOOLBAR */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '10px 14px',
          marginBottom: '16px',
        }}
      >
        {/* Left: Search & Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '300px' }}>
          {/* Live Search */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, ID, designation..."
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-sunken)',
                fontSize: '12px',
                color: 'var(--foreground)',
              }}
            />

            {/* Search Dropdown */}
            {searchOpen && searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                  zIndex: 200,
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => handleSearchResultClick(emp)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                    className="search-item-hover"
                  >
                    <EmployeeAvatar name={emp.name} size={30} deptStyle={getDeptStyle(emp.department)} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{emp.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {emp.designation} • {emp.department}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-sunken)',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--foreground)',
              cursor: 'pointer',
            }}
          >
            <option value="">Full Company (All Departments)</option>
            {hrStore.getDepartments().map((dept) => (
              <option key={dept.id || dept.name} value={dept.name}>
                {dept.name} {dept.head && dept.head !== 'Unassigned' ? `(${dept.head})` : ''}
              </option>
            ))}
          </select>

          {/* Admin & HR Scope Simulation / "View As" Selector */}
          {canManageEmployees && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={14} style={{ color: activeViewerId ? '#0284c7' : 'var(--muted)' }} />
              <select
                value={activeViewerId}
                onChange={(e) => setActiveViewerId(e.target.value)}
                title="Preview Org Tree scoped exactly as this role/employee sees it"
                style={{
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: activeViewerId ? '1px solid #0284c7' : '1px solid var(--border)',
                  backgroundColor: activeViewerId ? 'rgba(2, 132, 199, 0.08)' : 'var(--surface-sunken)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: activeViewerId ? '#0284c7' : 'var(--foreground)',
                  cursor: 'pointer',
                  maxWidth: '240px',
                }}
              >
                <option value="">Scope: Full Org (Admin/HR View)</option>
                <optgroup label="Simulate as Director">
                  {allEmployees.filter((e) => e.role === 'director').map((e) => (
                    <option key={e.id} value={e.id}>{e.displayName || e.name} (Overall Director)</option>
                  ))}
                </optgroup>
                <optgroup label="Simulate as Department Managers">
                  {allEmployees.filter((e) => e.role === 'manager').map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department} Mgr)</option>
                  ))}
                </optgroup>
                <optgroup label="Simulate as Team Leads">
                  {allEmployees.filter((e) => e.role === 'team_lead').map((e) => (
                    <option key={e.id} value={e.id}>{e.name} (TL - {e.department})</option>
                  ))}
                </optgroup>
                <optgroup label="Simulate as Employees / Staff">
                  {allEmployees.filter((e) => e.role === 'employee').slice(0, 10).map((e) => (
                    <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                  ))}
                </optgroup>
              </select>
            </div>
          )}
        </div>

        {/* Right: View Switcher, Zoom & Expansion Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Mobile/Desktop View Mode Switcher */}
          <div style={{ display: 'inline-flex', background: 'var(--surface-sunken)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border)' }}>
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'canvas' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'canvas' ? 'var(--primary)' : 'var(--muted)',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Layers size={13} />
              <span>Canvas</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('outline')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'outline' ? 'var(--surface)' : 'transparent',
                color: viewMode === 'outline' ? 'var(--primary)' : 'var(--muted)',
                fontWeight: 700,
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Network size={13} />
              <span>Tree List</span>
            </button>
            </div>

          <button
            type="button"
            onClick={handleExpandAll}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--foreground)',
            }}
          >
            Expand All
          </button>

          <button
            type="button"
            onClick={handleCollapseAll}
            style={{
              padding: '6px 12px',
              borderRadius: '7px',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: 'var(--foreground)',
            }}
          >
            Collapse All
          </button>

          {viewMode === 'canvas' && (
            <>
              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border)', margin: '0 4px' }} />

              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In"
                style={{
                  padding: '6px 8px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomIn size={15} />
              </button>

              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out"
                style={{
                  padding: '6px 8px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ZoomOut size={15} />
              </button>

              <button
                type="button"
                onClick={handleFitScreen}
                title="Fit to Screen"
                style={{
                  padding: '6px 8px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Maximize2 size={15} />
              </button>

              <button
                type="button"
                onClick={handleResetView}
                title="Reset View"
                style={{
                  padding: '6px 8px',
                  borderRadius: '7px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--foreground)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RotateCcw size={15} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* SCOPED VISIBILITY BANNER */}
      {scoped && (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid #0284c7',
            borderLeft: '4px solid #0284c7',
            borderRadius: '10px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--foreground)' }}>
                Role-Scoped Hierarchy View Active
                {targetEmployee && (
                  <span style={{ fontWeight: 600, color: '#0284c7', marginLeft: '6px' }}>
                    — Viewing as: {targetEmployee.name} ({targetEmployee.designation || targetEmployee.role})
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>
                {Array.isArray(reportingLine) && reportingLine.length > 0 ? (
                  <span>
                    Upward Line: <strong>{reportingLine.join(' ➔ ')}</strong>
                  </span>
                ) : typeof reportingLine === 'string' && reportingLine.trim().length > 0 ? (
                  <span>
                    Upward Line: <strong>{reportingLine}</strong>
                  </span>
                ) : (
                  <span>Visibility restricted strictly to upward management chain & direct squad reports.</span>
                )}
              </div>
            </div>
          </div>

          {canManageEmployees && activeViewerId && (
            <button
              type="button"
              onClick={() => setActiveViewerId('')}
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-sunken)',
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Reset to Full Organization View
            </button>
          )}
        </div>
      )}

      {/* MAIN WORKBENCH: CANVAS / OUTLINE / WORKFLOW + SLIDE-OVER DETAILS PANEL */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '14px',
          border: '1px solid var(--border)',
          backgroundColor: 'var(--surface-sunken)',
          minHeight: '520px',
        }}
      >
        {viewMode === 'outline' ? (
          /* OUTLINE MODE FOR PHONES / MOBILE SCREENS */
          <div style={{ flex: 1, padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Company Reporting Tree (Expandable Levels)
            </div>
            {roots.map((rootNode) => (
              <OrgOutlineBranch
                key={rootNode.id}
                node={rootNode}
                level={0}
                selectedId={selectedNode?.id}
                collapsedMap={collapsedMap}
                onToggleCollapse={handleToggleCollapse}
                onSelect={handleSelectEmployee}
              />
            ))}
            {roots.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted)', background: 'var(--surface)', borderRadius: '10px' }}>
                No employees match the current filter.
              </div>
            )}
          </div>
        ) : (
          /* INTERACTIVE CANVAS */
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              flex: 1,
              overflow: 'auto',
              position: 'relative',
              cursor: isPanning ? 'grabbing' : 'grab',
              padding: '60px 40px',
              display: 'flex',
              justifyContent: 'center',
              backgroundImage:
                'radial-gradient(var(--border) 1px, transparent 1px), radial-gradient(var(--border) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              backgroundPosition: '0 0, 12px 12px',
            }}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'top center',
                transition: isPanning ? 'none' : 'transform 0.15s ease-out',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '40px',
              }}
            >
              {roots.map((rootNode) => (
                <OrgTreeBranch
                  key={rootNode.id}
                  node={rootNode}
                  selectedId={selectedNode?.id}
                  chainSet={chainSet}
                  collapsedMap={collapsedMap}
                  onToggleCollapse={handleToggleCollapse}
                  onSelect={handleSelectEmployee}
                />
              ))}

              {roots.length === 0 && (
                <div
                  style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: 'var(--muted)',
                    backgroundColor: 'var(--surface)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <AlertCircle size={32} style={{ marginBottom: '8px', color: 'var(--primary)' }} />
                  <h3>No employees match the current filter</h3>
                  <p style={{ fontSize: '13px', margin: '4px 0 16px 0' }}>
                    Try resetting the department filter to view the complete organizational tree.
                  </p>
                  <button type="button" className="ui-button" onClick={() => setDepartmentFilter('')}>
                    View Complete Organization
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT SIDE DETAILS DRAWER */}
        {selectedNode && (
          <aside className="org-details-drawer">
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <EmployeeAvatar name={selectedNode.name} size={54} deptStyle={deptStyle} />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, margin: 0 }}>{selectedNode.name}</h3>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    {selectedNode.designation}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: deptStyle?.badge,
                        color: deptStyle?.text,
                      }}
                    >
                      {selectedNode.department}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--surface-sunken)',
                        color: 'var(--muted)',
                      }}
                    >
                      {selectedNode.employeeId}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  padding: '4px',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  backgroundColor: 'var(--surface-sunken)',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Status</span>
                  <strong style={{ color: selectedNode.status === 'active' ? '#10b981' : '#f59e0b' }}>
                    {selectedNode.status || 'Active'}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Type</span>
                  <strong>{selectedNode.employmentType || 'Full-time'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Location</span>
                  <span style={{ fontWeight: 600 }}>{selectedNode.location || 'Headquarters'}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--muted)', fontSize: '11px', display: 'block' }}>Joined</span>
                  <span style={{ fontWeight: 600 }}>{selectedNode.joiningDate || '2023-01-01'}</span>
                </div>
              </div>

              {/* Contact Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                  <Mail size={14} />
                  <span style={{ color: 'var(--foreground)' }}>{selectedNode.email}</span>
                </div>
                {selectedNode.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
                    <Phone size={14} />
                    <span style={{ color: 'var(--foreground)' }}>{selectedNode.phone}</span>
                  </div>
                )}
              </div>

              {/* REPORTING CHAIN (Interactive Breadcrumb) */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--muted)',
                    marginBottom: '10px',
                    letterSpacing: '0.04em',
                  }}
                >
                  Reporting Chain
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {reportingChain.map((chainEmp, idx) => {
                    const isCurrent = String(chainEmp.id || chainEmp._id) === String(selectedNode.id)
                    return (
                      <div
                        key={chainEmp.id || idx}
                        onClick={() => handleSelectEmployee(chainEmp)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: isCurrent ? 'var(--surface-sunken)' : 'transparent',
                          border: isCurrent ? '1px solid var(--border)' : '1px solid transparent',
                          fontWeight: isCurrent ? 700 : 500,
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ color: 'var(--muted)', fontSize: '10px', width: '14px' }}>
                          {idx + 1}.
                        </span>
                        <EmployeeAvatar
                          name={chainEmp.name}
                          size={24}
                          deptStyle={getDeptStyle(chainEmp.department)}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {chainEmp.name}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{chainEmp.designation}</div>
                        </div>
                        {isCurrent && (
                          <span
                            style={{
                              fontSize: '10px',
                              backgroundColor: 'var(--primary)',
                              color: '#fff',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Selected
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* DIRECT REPORTS ROSTER */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--muted)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Direct Reports ({directReports.length})
                  </span>
                </div>

                {directReports.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {directReports.map((report) => (
                      <div
                        key={report.id}
                        onClick={() => handleSelectEmployee(report)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          backgroundColor: 'var(--surface)',
                          fontSize: '12px',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        <EmployeeAvatar
                          name={report.name}
                          size={28}
                          deptStyle={getDeptStyle(report.department)}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {report.name}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--muted)' }}>{report.designation}</div>
                        </div>
                        <ArrowRight size={14} style={{ color: 'var(--muted)' }} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontStyle: 'italic' }}>
                    Individual Contributor (no direct reports).
                  </div>
                )}
              </div>

              {/* QUICK ACTIONS */}
              {canManageEmployees && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setChangeMgrModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--surface-sunken)',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <UserCheck size={14} />
                    <span>Change Reporting Manager</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTransferDeptModalOpen(true)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--surface-sunken)',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Building2 size={14} />
                    <span>Transfer Department</span>
                  </button>

                  <a
                    href={`#/hr/people/${selectedNode.id}`}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: 'transparent',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      textAlign: 'center',
                    }}
                  >
                    <ExternalLink size={14} />
                    <span>View Complete Dossier</span>
                  </a>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* POPUP MODALS */}
      <ChangeManagerModal
        employee={selectedNode}
        allEmployees={allEmployees}
        isOpen={changeMgrModalOpen}
        onClose={() => setChangeMgrModalOpen(false)}
        onSave={handleSaveManager}
      />

      <TransferDepartmentModal
        employee={selectedNode}
        allEmployees={allEmployees}
        isOpen={transferDeptModalOpen}
        onClose={() => setTransferDeptModalOpen(false)}
        onSave={handleSaveDepartmentTransfer}
      />

      <QuickAddEmployeeModal
        allEmployees={allEmployees}
        defaultManagerId={selectedNode?.id}
        isOpen={addEmpModalOpen}
        onClose={() => setAddEmpModalOpen(false)}
        onCreated={handleEmployeeCreated}
      />
    </div>
  )
}
