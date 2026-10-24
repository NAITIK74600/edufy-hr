import React, { useState, useEffect } from 'react'
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  BookOpen,
  Lock,
  ExternalLink,
  X,
  FileCheck2,
  Calendar,
  Sparkles,
  Search,
  Filter,
} from 'lucide-react'
import { COMPANY_POLICIES } from '../constants/companyPolicies'
import { hrStore } from '../services/hrStore'
import { useAuth } from '../auth/AuthContext'

export function CompanyPoliciesView({
  employee: propEmployee,
  isEmbedded = false,
  onConsentUpdated,
}) {
  const { user } = useAuth()
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [activePdfModal, setActivePdfModal] = useState(null)
  const [agreeingState, setAgreeingState] = useState({})
  const [agreeAllModal, setAgreeAllModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => hrStore.subscribe(setStoreState), [])

  // Resolve target employee record
  const currentEmployee = propEmployee
    ? (storeState.employees?.find(e => e.id === propEmployee.id || e._id === propEmployee.id || e.employeeId === propEmployee.employeeId) || propEmployee)
    : (storeState.employees?.find(e =>
        e.id === user?.id ||
        e._id === user?.id ||
        e.employeeId === user?.employeeId ||
        (user?.email && e.email && e.email.toLowerCase() === user.email.toLowerCase())
      ) || user)

  const isHRorAdmin = ['admin', 'hr', 'superadmin'].includes(String(user?.role || '').toLowerCase().trim())
  const isViewingSelf = Boolean(
    !propEmployee ||
    currentEmployee?.id === user?.id ||
    currentEmployee?._id === user?.id ||
    currentEmployee?.employeeId === user?.employeeId ||
    (user?.email && currentEmployee?.email && user.email.toLowerCase() === currentEmployee.email.toLowerCase())
  )

  const validKeys = COMPANY_POLICIES.map(p => p.key || p.id)
  const rawConsents = currentEmployee?.policyConsents || currentEmployee?.onboardingDocs?.policyConsents || {}
  // Strictly filter out any other/old consents: only the 4 PDFs in "company policy" are accepted
  const consents = Object.fromEntries(
    Object.entries(rawConsents).filter(([k]) => validKeys.includes(k))
  )
  const totalPolicies = COMPANY_POLICIES.length
  const consentedCount = COMPANY_POLICIES.filter(p => consents[p.key]?.consented || consents[p.id]?.consented).length
  const allConsented = consentedCount === totalPolicies

  const handleSingleConsent = async (policy) => {
    const policyKey = policy.key || policy.id
    setAgreeingState(prev => ({ ...prev, [policyKey]: true }))
    try {
      const now = new Date()
      const formatted = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      const consentPayload = {
        policyTitle: policy.title,
        policyFileName: policy.fileName,
        consentedAt: now.toISOString(),
        consentedDateFormatted: formatted,
        consentedBy: currentEmployee?.name || user?.displayName || 'Employee',
        employeeId: currentEmployee?.employeeId || user?.employeeId,
      }

      if (hrStore.savePolicyConsent) {
        await hrStore.savePolicyConsent(currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId, policyKey, consentPayload)
      } else {
        const updated = { ...consents, [policyKey]: { consented: true, ...consentPayload } }
        await hrStore.updateEmployee(currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId, {
          policyConsents: updated,
        })
      }

      setFeedback(`Successfully recorded your digital consent for "${policy.title}" with timestamp: ${formatted}`)
      setTimeout(() => setFeedback(''), 6000)
      if (onConsentUpdated) onConsentUpdated()
    } catch (err) {
      console.error('Failed to save policy consent:', err)
      alert('Failed to record policy consent. Please try again.')
    } finally {
      setAgreeingState(prev => ({ ...prev, [policyKey]: false }))
    }
  }

  const handleConsentAll = async () => {
    setAgreeingState(prev => ({ ...prev, all: true }))
    try {
      const now = new Date()
      const formatted = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })

      if (hrStore.saveAllPolicyConsents) {
        await hrStore.saveAllPolicyConsents(
          currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId,
          COMPANY_POLICIES,
          { consentedDateFormatted: formatted }
        )
      } else {
        const bulk = { ...consents }
        COMPANY_POLICIES.forEach(p => {
          bulk[p.key || p.id] = {
            consented: true,
            consentedAt: now.toISOString(),
            consentedDateFormatted: formatted,
            consentedBy: currentEmployee?.name || user?.displayName || 'Employee',
            employeeId: currentEmployee?.employeeId || user?.employeeId,
            policyTitle: p.title,
            policyFileName: p.fileName,
          }
        })
        await hrStore.updateEmployee(currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId, {
          policyConsents: bulk,
        })
      }

      setAgreeAllModal(false)
      setFeedback(`All ${totalPolicies} company policies acknowledged and signed with timestamp: ${formatted}`)
      setTimeout(() => setFeedback(''), 6000)
      if (onConsentUpdated) onConsentUpdated()
    } catch (err) {
      console.error('Failed to sign all policies:', err)
      alert('Failed to record consents. Please try again.')
    } finally {
      setAgreeingState(prev => ({ ...prev, all: false }))
    }
  }

  const filteredPolicies = COMPANY_POLICIES.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Header Banner */}
      {!isEmbedded && (
        <div
          style={{
            padding: '24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #0A2E33 0%, #004D50 100%)',
            color: '#ffffff',
            boxShadow: '0 10px 25px rgba(10, 46, 51, 0.15)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.5px' }}>
              <ShieldCheck size={13} /> OFFICIAL COMPLIANCE REPOSITORY
            </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
              Company Policies & Mandatory Employee Consent
            </h2>
            <p style={{ margin: 0, fontSize: '13px', color: '#c5e2e4', maxWidth: '680px', lineHeight: 1.5 }}>
              All employees are required to review each official company policy document and record their digital acknowledgment with verified date and time.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '10px', textAlign: 'right', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '11px', color: '#b2d9dc', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Compliance Status</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: allConsented ? '#86efac' : '#fde047', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                {allConsented ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                {consentedCount} of {totalPolicies} Acknowledged
              </div>
            </div>
            {isViewingSelf && !allConsented && (
              <button
                type="button"
                className="ui-button primary"
                onClick={() => setAgreeAllModal(true)}
                style={{ background: '#059669', borderColor: '#059669', color: '#ffffff', fontWeight: 600, fontSize: '12px', padding: '6px 14px' }}
              >
                <FileCheck2 size={14} /> Sign & Consent to All
              </button>
            )}
          </div>
        </div>
      )}

      {/* Embedded Banner when inside Onboarding Dossier */}
      {isEmbedded && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: '12px',
            background: allConsented ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            border: allConsented ? '1px solid #86efac' : '1px solid #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: allConsented ? '#15803d' : '#0284c7',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {allConsented ? <CheckCircle2 size={12} /> : <ShieldCheck size={12} />}
                {allConsented ? '100% POLICIES ACKNOWLEDGED' : 'MANDATORY ONBOARDING COMPLIANCE'}
              </span>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                {consentedCount} / {totalPolicies} Consented
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              During onboarding, review each official PDF policy below and confirm your digital acceptance. Each consent is saved with your identity and exact timestamp.
            </p>
          </div>

          {isViewingSelf && !allConsented && (
            <button
              type="button"
              className="ui-button primary"
              onClick={() => setAgreeAllModal(true)}
              style={{ background: 'var(--teal)', borderColor: 'var(--teal)', color: '#ffffff', fontWeight: 600, fontSize: '12px', padding: '6px 14px' }}
            >
              <FileCheck2 size={14} /> Sign & Consent to All
            </button>
          )}
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '240px' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="ui-input"
              placeholder="Search policies by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '32px', fontSize: '12px' }}
            />
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Showing <strong>{filteredPolicies.length}</strong> official company policies
        </div>
      </div>

      {/* Policies Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {filteredPolicies.map((policy) => {
          const policyKey = policy.key || policy.id
          const consent = consents[policyKey] || consents[policy.id] || {}
          const hasConsented = Boolean(consent?.consented)
          const isAgreeing = Boolean(agreeingState[policyKey])

          return (
            <div
              key={policy.id}
              className="panel"
              style={{
                padding: '20px',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                border: hasConsented ? '1px solid #86efac' : '1px solid #cbd5e1',
                background: hasConsented ? '#fbfdfb' : '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease',
              }}
            >
              <div>
                {/* Top Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#fee2e2',
                      color: '#b91c1c',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {policy.fileType} • {policy.sizeLabel}
                  </span>

                  {hasConsented ? (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#dcfce7',
                        color: '#15803d',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={11} /> CONSENT RECORDED
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: '#fef3c7',
                        color: '#b45309',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Clock size={11} /> PENDING CONSENT
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <BookOpen size={18} style={{ color: hasConsented ? '#16a34a' : 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{policy.title}</span>
                </h4>

                <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                  {policy.description}
                </p>

                {/* Consent Timestamp Banner */}
                {hasConsented ? (
                  <div
                    style={{
                      padding: '10px 12px',
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#166534',
                      display: 'grid',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                      <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                      <span>Legally Acknowledged & Accepted</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#15803d' }}>
                      <Calendar size={12} />
                      <span>Timestamp: <strong>{consent.consentedDateFormatted || new Date(consent.consentedAt).toLocaleString()}</strong></span>
                    </div>
                    {consent.consentedBy && (
                      <div style={{ fontSize: '10.5px', color: '#166534' }}>
                        Signed By: <strong>{consent.consentedBy}</strong> {consent.employeeId ? `(${consent.employeeId})` : ''}
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '10px 12px',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <AlertCircle size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                    <span>Please read the PDF document in full before giving your digital consent.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* View PDF in Modal */}
                  <button
                    type="button"
                    onClick={() => setActivePdfModal(policy)}
                    className="ui-button secondary"
                    style={{
                      flex: 1,
                      fontSize: '11.5px',
                      padding: '8px 12px',
                      justifyContent: 'center',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Eye size={13} /> Read Official Policy
                  </button>
                </div>

                {/* Consent Action for Employee */}
                {isViewingSelf && (
                  <div>
                    {hasConsented ? (
                      <div
                        style={{
                          width: '100%',
                          padding: '7px 12px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          fontSize: '11px',
                          color: '#64748b',
                          textAlign: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Lock size={12} /> Consent Locked & Verified
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSingleConsent(policy)}
                        disabled={isAgreeing}
                        className="ui-button primary"
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          padding: '8px 14px',
                          justifyContent: 'center',
                          background: 'var(--teal)',
                          borderColor: 'var(--teal)',
                          color: '#ffffff',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <CheckCircle2 size={14} />
                        {isAgreeing ? 'Saving Consent...' : 'I Agree & Consent to this Policy'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* PDF Viewer Modal */}
      {activePdfModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100010,
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
          onClick={() => setActivePdfModal(null)}
        >
          <div
            className="panel"
            style={{
              width: '94%',
              maxWidth: '960px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              borderRadius: '14px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '14px 20px',
                background: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BookOpen size={20} style={{ color: '#38bdf8' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                    {activePdfModal.title}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {activePdfModal.fileName} • {activePdfModal.sizeLabel}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setActivePdfModal(null)}
                  className="icon-button"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '6px',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div style={{ flex: 1, background: '#525659', position: 'relative' }}>
              <iframe
                src={`${activePdfModal.downloadUrl}#toolbar=0&navpanes=0`}
                title={activePdfModal.title}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>

            {/* Modal Footer with Direct Consent Button */}
            <div
              style={{
                padding: '12px 20px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {consents[activePdfModal.key || activePdfModal.id]?.consented ? (
                  <span style={{ color: '#15803d', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Acknowledged on {consents[activePdfModal.key || activePdfModal.id]?.consentedDateFormatted}
                  </span>
                ) : (
                  <span>Ensure you have read all pages before acknowledging this policy.</span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="ui-button secondary"
                  onClick={() => setActivePdfModal(null)}
                >
                  Close Viewer
                </button>
                {isViewingSelf && !consents[activePdfModal.key || activePdfModal.id]?.consented && (
                  <button
                    type="button"
                    className="ui-button primary"
                    style={{ background: 'var(--teal)', borderColor: 'var(--teal)', color: '#fff', fontWeight: 600 }}
                    onClick={() => {
                      handleSingleConsent(activePdfModal)
                    }}
                    disabled={agreeingState[activePdfModal.key || activePdfModal.id]}
                  >
                    <CheckCircle2 size={14} /> I Have Read & Agree to this Policy
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Consent Modal */}
      {agreeAllModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100010,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
          onClick={() => setAgreeAllModal(false)}
        >
          <div
            className="panel"
            style={{
              width: '92%',
              maxWidth: '540px',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center' }}>
                  <FileCheck2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                    Sign & Acknowledge All Policies
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Confirm digital acceptance for all {totalPolicies} official Edufyi policies.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAgreeAllModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', fontSize: '12px', color: '#334155', display: 'grid', gap: '8px' }}>
              <div style={{ fontWeight: 600, color: '#0f172a' }}>Policies covered by this consent:</div>
              {COMPANY_POLICIES.map((p, idx) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#475569' }}>
                  <CheckCircle2 size={13} style={{ color: '#059669', flexShrink: 0 }} />
                  <span><strong>{idx + 1}.</strong> {p.title}</span>
                </div>
              ))}
            </div>

            <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
              By confirming, you certify that you have accessed and reviewed each of the 4 official policy documents (Company Policies & Code of Conduct, Attendance Policy, Sales Policy, and Zero Tolerance Policy), and you consent to adhere strictly to all terms and standards. Your full name (<strong>{currentEmployee?.name || user?.displayName}</strong>), employee ID (<strong>{currentEmployee?.employeeId || user?.employeeId}</strong>), and the current date and time will be recorded in the official compliance audit log.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="ui-button secondary"
                onClick={() => setAgreeAllModal(false)}
                disabled={agreeingState.all}
              >
                Cancel
              </button>
              <button
                type="button"
                className="ui-button primary"
                style={{ background: '#059669', borderColor: '#059669', color: '#ffffff', fontWeight: 600 }}
                onClick={handleConsentAll}
                disabled={agreeingState.all}
              >
                {agreeingState.all ? 'Signing Consents...' : 'I Agree & Confirm Digital Signature'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
