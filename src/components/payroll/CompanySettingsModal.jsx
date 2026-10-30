import React, { useState } from 'react'

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

export function CompanySettingsModal({
  settings = {},
  onSave,
  onClose,
}) {
  const [form, setForm] = useState({
    companyName: settings.companyName || 'Elythra Edufyi Tech Solutions Pvt Ltd',
    companyLegalName: settings.companyLegalName || 'Elythra Edufyi Tech Solutions Pvt Ltd',
    address: settings.address || 'Third Floor, 7 Hills, #424, 10th Cross, 27th Main, Sector 1, HSR Layout, Bengaluru, Karnataka 560102',
    phone: settings.phone || '+91 80 4567 8900',
    email: settings.email || 'hr@edufyitech.in',
    website: settings.website || 'https://edufyitech.in',
    taxId: settings.taxId || '29AABCE1234F1Z5',
    currency: settings.currency || 'INR',
    currencySymbol: settings.currencySymbol || '₹',
    logoUrl: settings.logoUrl || '/elythra-edufyitech-logo.png',
    primaryColor: settings.primaryColor || '#087E9E',
    secondaryColor: settings.secondaryColor || '#0B3155',
    footerText: settings.footerText || 'This Computer generated document, No signature is required. This document contains confidential information.',
    maskBankAccount: Boolean(settings.maskBankAccount === true),
    defaultBranch: (settings.defaultBranch === 'IGNITE CAMPUS' || !settings.defaultBranch) ? 'Bengaluru HQ' : settings.defaultBranch,
    branchAddress: settings.branchAddress || '',
    branchCity: settings.branchCity || 'Bengaluru',
  })

  const availableBranches = Array.from(
    new Set([
      'Bengaluru HQ',
      ...(Array.isArray(settings.branches) ? settings.branches.filter(b => !['IGNITE CAMPUS', 'Delhi NCR Branch', 'Hyderabad Tech Hub', 'Mumbai Regional Office', 'Remote / Distributed', 'Bengaluru'].includes(b)) : []),
      ...(Array.isArray(settings.locations) ? settings.locations.map((l) => typeof l === 'string' ? l : l.name).filter(b => !['IGNITE CAMPUS', 'Delhi NCR Branch', 'Hyderabad Tech Hub', 'Mumbai Regional Office', 'Remote / Distributed', 'Bengaluru'].includes(b)) : []),
    ].filter(Boolean))
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, logoUrl: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update company settings.')
    } finally {
      setSaving(false)
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
          maxWidth: '680px',
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
              Company Branding & Payslip Configuration
            </h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Changes will dynamically reflect on all generated payslip headers and vouchers.
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

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          {/* Logo Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px', background: '#f8fafc' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
              Company Logo
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              {form.logoUrl && (
                <div style={{ padding: '6px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '4px' }}>
                  <img src={form.logoUrl} alt="Logo Preview" style={{ maxHeight: '48px', maxWidth: '140px', objectFit: 'contain', display: 'block' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ fontSize: '12px' }}
                />
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                  Or enter logo image URL:
                </div>
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="/elythra-edufyitech-logo.png"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* Legal details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Company Trade Name</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Company Legal / Registered Name</label>
              <input
                type="text"
                required
                value={form.companyLegalName}
                onChange={(e) => setForm({ ...form, companyLegalName: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Complete Registered Address</label>
            <textarea
              required
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>

          {/* Office Branch & Work Location */}
          <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '14px', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#0B3155', margin: 0 }}>
                🏢 Default Office Branch & Payroll Location
              </label>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Applies to company salary slips & vouchers</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Branch Name</label>
                <select
                  value={availableBranches.includes(form.defaultBranch) ? form.defaultBranch : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') {
                      setForm({ ...form, defaultBranch: e.target.value })
                    } else {
                      setForm({ ...form, defaultBranch: '' })
                    }
                  }}
                  style={inputStyle}
                >
                  {availableBranches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__custom__">+ Enter Custom Branch...</option>
                </select>
                {(!availableBranches.includes(form.defaultBranch) || form.defaultBranch === '') && (
                  <input
                    type="text"
                    placeholder="Enter custom branch name..."
                    value={form.defaultBranch}
                    onChange={(e) => setForm({ ...form, defaultBranch: e.target.value })}
                    style={{ ...inputStyle, marginTop: '6px' }}
                  />
                )}
              </div>
              <div>
                <label style={labelStyle}>Branch City / State</label>
                <input
                  type="text"
                  placeholder="e.g. Bengaluru, Karnataka"
                  value={form.branchCity}
                  onChange={(e) => setForm({ ...form, branchCity: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ marginTop: '10px' }}>
              <label style={labelStyle}>Branch Specific Address (Optional override on payslip vouchers)</label>
              <input
                type="text"
                placeholder="Leave blank to use main registered address"
                value={form.branchAddress}
                onChange={(e) => setForm({ ...form, branchAddress: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Payroll / HR Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Official Website</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
            <div>
              <label style={labelStyle}>GST / PAN / Tax ID</label>
              <input
                type="text"
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Currency Code</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Currency Symbol</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => setForm({ ...form, currencySymbol: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Brand Colors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Primary Color (Tables, Headers)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  style={{ width: '40px', height: '36px', padding: '2px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Secondary Color (Subheaders, Text)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  style={{ width: '40px', height: '36px', padding: '2px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.maskBankAccount}
                onChange={(e) => setForm({ ...form, maskBankAccount: e.target.checked })}
              />
              <span>Mask bank account numbers on payslip vouchers (e.g. ●●●●●●●●7650)</span>
            </label>
          </div>

          <div>
            <label style={labelStyle}>Payslip Footer Disclaimer Text</label>
            <input
              type="text"
              value={form.footerText}
              onChange={(e) => setForm({ ...form, footerText: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#087E9E', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CompanySettingsModal
