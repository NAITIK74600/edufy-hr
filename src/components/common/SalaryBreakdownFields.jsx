import React from 'react'
import { DollarSign, Calculator, Info, RefreshCw } from 'lucide-react'
import { formatINR } from '../../utils/currency.js'
import { calculateComponentsFromCTC, calculateCTCFromComponents } from '../../utils/salaryCalculator'

/**
 * Reusable Salary Structure Editor Component
 * Manages Annual CTC and its breakdown:
 * - Basic Pay
 * - HRA (House Rent Allowance)
 * - CA (Conveyance Allowance)
 * - SA (Special Allowance)
 * - OA (Other Allowance)
 * 
 * Supports both props: `salary` or `annualCtc`.
 * Emits both in onChange: `{ salary, annualCtc, salaryStructure }`.
 */
export function SalaryBreakdownFields({
  salary,
  annualCtc,
  value,
  salaryStructure = {},
  onChange,
  disabled = false,
  showTitle = true,
  sectionTitle,
}) {
  // Normalize incoming salary prop
  const currentSalary = salary !== undefined && salary !== null
    ? salary
    : (annualCtc !== undefined && annualCtc !== null
      ? annualCtc
      : (value !== undefined && value !== null ? value : ''))

  const currentBasic = salaryStructure?.basic ?? ''
  const currentHra = salaryStructure?.hra ?? ''
  const currentCa = salaryStructure?.conveyance ?? salaryStructure?.ca ?? ''
  const currentSa = salaryStructure?.specialAllowance ?? salaryStructure?.sa ?? ''
  const currentOa = salaryStructure?.otherAllowance ?? salaryStructure?.oa ?? ''

  const numBasic = Number(currentBasic) || 0
  const numHra = Number(currentHra) || 0
  const numCa = Number(currentCa) || 0
  const numSa = Number(currentSa) || 0
  const numOa = Number(currentOa) || 0

  const monthlyGross = numBasic + numHra + numCa + numSa + numOa
  const effectiveAnnual = monthlyGross > 0 ? monthlyGross * 12 : (Number(currentSalary) || 0)

  const emitUpdate = (newAnnual, newStruct) => {
    const annualStr = newAnnual === '' || newAnnual === null || newAnnual === undefined ? '' : String(newAnnual)
    onChange?.({
      salary: annualStr,
      annualCtc: annualStr,
      annualSalary: annualStr,
      salaryStructure: {
        basic: newStruct.basic === '' ? 0 : Number(newStruct.basic) || 0,
        hra: newStruct.hra === '' ? 0 : Number(newStruct.hra) || 0,
        conveyance: newStruct.conveyance === '' ? 0 : Number(newStruct.conveyance) || 0,
        ca: newStruct.conveyance === '' ? 0 : Number(newStruct.conveyance) || 0,
        specialAllowance: newStruct.specialAllowance === '' ? 0 : Number(newStruct.specialAllowance) || 0,
        sa: newStruct.specialAllowance === '' ? 0 : Number(newStruct.specialAllowance) || 0,
        otherAllowance: newStruct.otherAllowance === '' ? 0 : Number(newStruct.otherAllowance) || 0,
        oa: newStruct.otherAllowance === '' ? 0 : Number(newStruct.otherAllowance) || 0,
      },
    })
  }

  // Handle direct change of a monthly breakdown component
  const handleComponentChange = (key, val) => {
    const rawVal = val === '' ? '' : Math.max(0, Number(val) || 0)
    const newStructure = {
      basic: key === 'basic' ? rawVal : (salaryStructure?.basic ?? ''),
      hra: key === 'hra' ? rawVal : (salaryStructure?.hra ?? ''),
      conveyance: key === 'ca' ? rawVal : (salaryStructure?.conveyance ?? salaryStructure?.ca ?? ''),
      specialAllowance: key === 'sa' ? rawVal : (salaryStructure?.specialAllowance ?? salaryStructure?.sa ?? ''),
      otherAllowance: key === 'oa' ? rawVal : (salaryStructure?.otherAllowance ?? salaryStructure?.oa ?? ''),
    }

    const calc = calculateCTCFromComponents(newStructure)
    emitUpdate(calc.annualCTC > 0 ? String(calc.annualCTC) : '', newStructure)
  }

  // Handle direct change to Annual Salary / CTC
  const handleAnnualSalaryChange = (newAnnual) => {
    if (newAnnual === '' || newAnnual === null || newAnnual === undefined) {
      emitUpdate('', {
        basic: '',
        hra: '',
        conveyance: '',
        ca: '',
        specialAllowance: '',
        sa: '',
        otherAllowance: '',
        oa: '',
      })
      return
    }

    const annualVal = Math.max(0, Number(newAnnual) || 0)
    // Auto-split into standard percentages
    const split = calculateComponentsFromCTC(annualVal)
    emitUpdate(newAnnual, {
      basic: split.basic,
      hra: split.hra,
      conveyance: split.conveyance,
      ca: split.conveyance,
      specialAllowance: split.specialAllowance,
      sa: split.specialAllowance,
      otherAllowance: split.otherAllowance,
      oa: split.otherAllowance,
    })
  }

  // Quick auto-split button action
  const handleAutoSplit = () => {
    const targetAnnual = Number(currentSalary) || effectiveAnnual || 360000
    const split = calculateComponentsFromCTC(targetAnnual)
    emitUpdate(String(split.annualCTC), {
      basic: split.basic,
      hra: split.hra,
      conveyance: split.conveyance,
      ca: split.conveyance,
      specialAllowance: split.specialAllowance,
      sa: split.specialAllowance,
      otherAllowance: split.otherAllowance,
      oa: split.otherAllowance,
    })
  }

  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginTop: '10px' }}>
      {showTitle && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calculator size={15} style={{ color: 'var(--teal)' }} />
              {sectionTitle || 'Compensation & Salary Structure (Basic, HRA, CA, SA, OA)'}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Fill components to auto-reflect in Annual CTC. Directly used in single and bulk payslip generation.
            </span>
          </div>

          <button
            type="button"
            onClick={handleAutoSplit}
            disabled={disabled}
            className="ui-button secondary"
            style={{ fontSize: '11px', padding: '4px 10px', background: '#ffffff', borderColor: '#cbd5e1', color: 'var(--teal)' }}
            title="Auto-calculate standard 50% Basic, HRA, CA, SA, and OA from Annual CTC"
          >
            <RefreshCw size={11} /> Auto-Split Standard Structure
          </button>
        </div>
      )}

      {/* Main Annual CTC and Monthly Gross overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Annual Salary / CTC (₹) *
          </label>
          <input
            type="number"
            min="0"
            step="1"
            required
            disabled={disabled}
            value={currentSalary}
            onChange={(e) => handleAnnualSalaryChange(e.target.value)}
            onFocus={(e) => {
              if (String(e.target.value) === '0') e.target.select()
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              fontWeight: 600,
              boxSizing: 'border-box',
            }}
            placeholder="e.g. 480000"
          />
        </div>

        <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase' }}>Monthly Gross</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f766e' }}>
              {formatINR(monthlyGross > 0 ? monthlyGross : Math.round((Number(currentSalary) || 0) / 12))}
            </div>
          </div>
          <div style={{ width: '1px', height: '28px', background: '#99f6e4' }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#0d9488', textTransform: 'uppercase' }}>Annual CTC</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f766e' }}>
              {formatINR(effectiveAnnual)}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Component Breakdown Grid: Basic, HRA, CA, SA, OA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {/* 1. Basic Pay */}
        <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>
            Basic Pay (₹)
          </label>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={currentBasic}
            onChange={(e) => handleComponentChange('basic', e.target.value)}
            onFocus={(e) => {
              if (String(e.target.value) === '0') e.target.select()
            }}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box' }}
            placeholder="0"
          />
          <span style={{ fontSize: '10px', color: '#64748b' }}>50% standard</span>
        </div>

        {/* 2. HRA */}
        <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>
            HRA (₹)
          </label>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={currentHra}
            onChange={(e) => handleComponentChange('hra', e.target.value)}
            onFocus={(e) => {
              if (String(e.target.value) === '0') e.target.select()
            }}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box' }}
            placeholder="0"
          />
          <span style={{ fontSize: '10px', color: '#64748b' }}>House Rent</span>
        </div>

        {/* 3. CA (Conveyance Allowance) */}
        <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>
            CA (₹)
          </label>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={currentCa}
            onChange={(e) => handleComponentChange('ca', e.target.value)}
            onFocus={(e) => {
              if (String(e.target.value) === '0') e.target.select()
            }}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box' }}
            placeholder="0"
          />
          <span style={{ fontSize: '10px', color: '#64748b' }}>Conveyance</span>
        </div>

        {/* 4. SA (Special Allowance) */}
        <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>
            SA (₹)
          </label>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={currentSa}
            onChange={(e) => handleComponentChange('sa', e.target.value)}
            onFocus={(e) => {
              if (String(e.target.value) === '0') e.target.select()
            }}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box' }}
            placeholder="0"
          />
          <span style={{ fontSize: '10px', color: '#64748b' }}>Special</span>
        </div>

        {/* 5. OA (Other Allowance) */}
        <div style={{ background: '#ffffff', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#1e293b', marginBottom: '3px' }}>
            OA (₹)
          </label>
          <input
            type="number"
            min="0"
            disabled={disabled}
            value={currentOa}
            onChange={(e) => handleComponentChange('oa', e.target.value)}
            onFocus={(e) => {
              if (String(e.target.value) === '0') e.target.select()
            }}
            style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600, boxSizing: 'border-box' }}
            placeholder="0"
          />
          <span style={{ fontSize: '10px', color: '#64748b' }}>Other / Flexi</span>
        </div>
      </div>
    </div>
  )
}
