import React, { useRef } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import {
  formatMonthInputToLabel,
  formatLabelToMonthInput,
  getPayrollMonthOptions,
  offsetMonth,
  formatToMonthYear,
} from '../../utils/monthHelper'

/**
 * Interactive Payroll Month Picker with dropdown, calendar picker, and step controls
 */
export function PayrollMonthPicker({
  value,
  onChange,
  allowAll = false,
  allLabel = 'All Months',
  existingRecords = [],
  showPresets = true,
  showSteppers = true,
  className = '',
  style = {},
  label,
}) {
  const dateInputRef = useRef(null)
  const rawOptions = getPayrollMonthOptions(existingRecords)
  const currentMonthLabel = formatToMonthYear(new Date())
  const nextMonthLabel = offsetMonth(currentMonthLabel, 1)

  const displayOptions = (value && value !== 'all' && !rawOptions.includes(value))
    ? [value, ...rawOptions].sort((a, b) => {
        const ymA = formatLabelToMonthInput(a)
        const ymB = formatLabelToMonthInput(b)
        return ymB.localeCompare(ymA)
      })
    : rawOptions

  const handleDateInputChange = (e) => {
    const raw = e.target.value
    if (!raw) return
    const formatted = formatMonthInputToLabel(raw)
    if (formatted) {
      onChange(formatted)
    }
  }

  const handleStep = (step) => {
    if (!value || value === 'all') {
      onChange(currentMonthLabel)
      return
    }
    const next = offsetMonth(value, step)
    onChange(next)
  }

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      try {
        if (typeof dateInputRef.current.showPicker === 'function') {
          dateInputRef.current.showPicker()
          return
        }
      } catch {}
      try {
        dateInputRef.current.focus()
        dateInputRef.current.click()
      } catch {}
    }
  }

  return (
    <div className={`payroll-month-picker-root ${className}`} style={{ display: 'grid', gap: '6px', ...style }}>
      {label && (
        <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--ink, #0A2328)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{label}</span>
          <span style={{ fontSize: '10.5px', color: 'var(--muted, #586D72)', fontWeight: 400 }}>
            Pick from calendar or list
          </span>
        </label>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        {/* Main Select Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '1', minWidth: '170px' }}>
          <select
            value={value}
            onChange={(e) => {
              if (e.target.value === '__open_calendar__') {
                handleCalendarClick()
              } else {
                onChange(e.target.value)
              }
            }}
            className="payroll-select"
            style={{
              width: '100%',
              minHeight: '36px',
              paddingLeft: '32px',
              paddingRight: '12px',
              fontSize: '12.5px',
              fontWeight: 500,
              background: '#ffffff',
              border: '1px solid var(--line, #D6E2E3)',
              borderRadius: '8px',
              color: 'var(--ink, #0A2328)',
              cursor: 'pointer',
            }}
          >
            {allowAll && <option value="all">{allLabel}</option>}
            {displayOptions.map((m) => {
              const isCurrent = m === currentMonthLabel
              return (
                <option key={m} value={m}>
                  {m} {isCurrent ? '• (Current)' : ''}
                </option>
              )
            })}
            <option value="__open_calendar__">📅 Pick from Calendar...</option>
          </select>
          <Calendar
            size={14}
            style={{
              position: 'absolute',
              left: '10px',
              color: 'var(--teal, #006E6F)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Interactive Calendar Trigger Button (Hidden HTML5 Month input) */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={handleCalendarClick}
            className="payroll-icon-btn"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid var(--line, #D6E2E3)',
              background: '#f8fafc',
              color: 'var(--teal, #006E6F)',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
            }}
            title="Open Calendar Month Picker"
          >
            <Calendar size={15} />
          </button>
          <input
            ref={dateInputRef}
            type="month"
            value={formatLabelToMonthInput(value)}
            onChange={handleDateInputChange}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none',
              border: 0,
              padding: 0,
            }}
            tabIndex={-1}
            aria-hidden="true"
          />
        </div>

        {/* Stepper Buttons (< and >) */}
        {showSteppers && (
          <div style={{ display: 'inline-flex', gap: '3px' }}>
            <button
              type="button"
              onClick={() => handleStep(-1)}
              className="payroll-icon-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--line, #D6E2E3)',
                background: '#f8fafc',
                color: '#475569',
                cursor: 'pointer',
              }}
              title="Previous Month"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleStep(1)}
              className="payroll-icon-btn"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid var(--line, #D6E2E3)',
                background: '#f8fafc',
                color: '#475569',
                cursor: 'pointer',
              }}
              title="Next Month"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Quick Presets */}
      {showPresets && (
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '2px' }}>
          <button
            type="button"
            onClick={() => onChange(currentMonthLabel)}
            style={{
              fontSize: '10.5px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: value === currentMonthLabel ? '1px solid var(--teal, #006E6F)' : '1px solid var(--line, #D6E2E3)',
              background: value === currentMonthLabel ? 'var(--soft-teal, #E1F1F0)' : '#f8fafc',
              color: value === currentMonthLabel ? 'var(--teal, #006E6F)' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Current ({currentMonthLabel.split(' ')[0]})
          </button>
          <button
            type="button"
            onClick={() => onChange(nextMonthLabel)}
            style={{
              fontSize: '10.5px',
              padding: '3px 8px',
              borderRadius: '6px',
              border: value === nextMonthLabel ? '1px solid var(--teal, #006E6F)' : '1px solid var(--line, #D6E2E3)',
              background: value === nextMonthLabel ? 'var(--soft-teal, #E1F1F0)' : '#f8fafc',
              color: value === nextMonthLabel ? 'var(--teal, #006E6F)' : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Next Month ({nextMonthLabel.split(' ')[0]})
          </button>
        </div>
      )}
    </div>
  )
}
