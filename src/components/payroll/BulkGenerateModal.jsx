import React, { useState } from 'react'
import { currentPayrollMonth } from '../../services/connectedStore'
import { PayrollMonthPicker } from './PayrollMonthPicker'

const labelStyle = {
  display: 'block',
  fontSize: '11.5px',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '4px',
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '5px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  boxSizing: 'border-box',
}

export function BulkGenerateModal({
  employees = [],
  onGenerate,
  onClose,
}) {
  const [month, setMonth] = useState(currentPayrollMonth)
  const [selectedDept, setSelectedDept] = useState('all')
  const [selectedBranch, setSelectedBranch] = useState('all')
  const [selectedIds, setSelectedIds] = useState(() =>
    employees.filter((e) => e.status === 'active').map((e) => e.employeeId)
  )
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const departments = ['all', ...new Set(employees.map((e) => e.department).filter(Boolean))]
  const branches = ['all', ...new Set(employees.map((e) => {
    const loc = e.location || e.branch
    if (!loc || ['bengaluru', 'ignite campus', 'ignite campus (bengaluru)', 'bengaluru hq'].includes(String(loc).toLowerCase())) {
      return 'Bengaluru HQ'
    }
    return loc
  }).filter(Boolean))]

  const filteredEmployees = employees.filter((e) => {
    if (e.status !== 'active') return false
    if (selectedDept !== 'all' && e.department !== selectedDept) return false
    if (selectedBranch !== 'all') {
      const loc = e.location || e.branch
      const norm = (!loc || ['bengaluru', 'ignite campus', 'ignite campus (bengaluru)', 'bengaluru hq'].includes(String(loc).toLowerCase())) ? 'Bengaluru HQ' : loc
      if (norm !== selectedBranch) return false
    }
    return true
  })

  const handleToggleAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEmployees.map((emp) => emp.employeeId))
    } else {
      setSelectedIds([])
    }
  }

  const handleToggleOne = (empId) => {
    setSelectedIds((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    )
  }

  const handleRun = async () => {
    if (selectedIds.length === 0) {
      setError('Please select at least one employee.')
      return
    }
    setBusy(true)
    setError(null)
    setResult(null)
    try {
      const res = await onGenerate({
        month,
        employeeIds: selectedIds,
        department: selectedDept,
        branch: selectedBranch,
      })
      setResult(res?.message || `Successfully generated bulk payroll drafts for ${selectedIds.length} employee(s).`)
    } catch (err) {
      setError(err.message || 'Bulk generation failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          padding: '24px',
          color: '#1a202c',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0B3155' }}>
              Bulk Payroll Generation
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Create reviewed draft payslips for multiple employees simultaneously.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {result && (
          <div style={{ background: '#f0fdf4', border: '1px solid #4ade80', color: '#166534', padding: '10px 14px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
            {result}
          </div>
        )}

        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <PayrollMonthPicker
                label="Payroll Period *"
                value={typeof month === 'function' ? month() : month}
                onChange={setMonth}
                showPresets={true}
                showSteppers={true}
              />
            </div>
            <div>
              <label style={labelStyle}>Filter Department</label>
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value)
                  const dept = e.target.value
                  const matching = employees.filter((emp) => {
                    if (emp.status !== 'active') return false
                    if (dept !== 'all' && emp.department !== dept) return false
                    if (selectedBranch !== 'all' && (emp.location || emp.branch) !== selectedBranch) return false
                    return true
                  })
                  setSelectedIds(matching.map((emp) => emp.employeeId))
                }}
                style={inputStyle}
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d === 'all' ? 'All Departments' : d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Filter Office Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => {
                  setSelectedBranch(e.target.value)
                  const branch = e.target.value
                  const matching = employees.filter((emp) => {
                    if (emp.status !== 'active') return false
                    if (selectedDept !== 'all' && emp.department !== selectedDept) return false
                    if (branch !== 'all' && (emp.location || emp.branch) !== branch) return false
                    return true
                  })
                  setSelectedIds(matching.map((emp) => emp.employeeId))
                }}
                style={inputStyle}
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b === 'all' ? 'All Branches' : b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Employees to Process ({selectedIds.length} of {filteredEmployees.length} selected)
              </label>
              <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#087E9E', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                  onChange={handleToggleAll}
                />
                Select All
              </label>
            </div>

            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', maxHeight: '240px', overflowY: 'auto', padding: '6px' }}>
              {filteredEmployees.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                  No active employees found matching the filters.
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isChecked = selectedIds.includes(emp.employeeId)
                  const loc = emp.location || emp.branch
                  const empBranch = (!loc || ['bengaluru', 'ignite campus', 'ignite campus (bengaluru)', 'bengaluru hq'].includes(String(loc).toLowerCase())) ? 'Bengaluru HQ' : loc
                  return (
                    <label
                      key={emp.id || emp.employeeId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        background: isChecked ? '#f0f9ff' : 'transparent',
                        borderBottom: '1px solid #f1f5f9',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleOne(emp.employeeId)}
                        />
                        <div>
                          <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
                            {emp.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                            {emp.employeeId} · {emp.department || 'General'} · <span style={{ color: '#087E9E', fontWeight: 600 }}>📍 {empBranch}</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#087E9E' }}>
                        CTC: ₹{(emp.salary || 400000).toLocaleString('en-IN')}/yr
                      </div>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Close
            </button>
            <button
              type="button"
              disabled={busy || selectedIds.length === 0}
              onClick={handleRun}
              style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#087E9E', color: '#ffffff', fontWeight: 700, cursor: 'pointer', opacity: busy || selectedIds.length === 0 ? 0.6 : 1 }}
            >
              {busy ? 'Processing...' : `Generate ${selectedIds.length} Payslip(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkGenerateModal
