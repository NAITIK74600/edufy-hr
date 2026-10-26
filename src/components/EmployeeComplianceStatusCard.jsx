import React, { useState } from 'react'
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  Lock,
  User,
  ExternalLink,
  BookOpen,
  FileCheck2,
  Sparkles,
  X,
  Building2,
  Check,
} from 'lucide-react'
import { COMPANY_POLICIES } from '../constants/companyPolicies'
import { COMPLIANCE_AND_NDA_TEMPLATES, OFFICIAL_COMPANY_DOCUMENTS } from '../constants/companyDocumentsConstants'
import { VERIFICATION_TEMPLATES } from '../constants/verificationConstants'

export function EmployeeComplianceStatusCard({ employee }) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'policies' | 'nda' | 'verification'
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'done' | 'pending'
  const [viewingModal, setViewingModal] = useState(null) // { title, url, type, isPdf }

  if (!employee) return null

  // 1. Company Policies Consent Data
  const rawConsents = employee.policyConsents || employee.onboardingDocs?.policyConsents || {}
  const policyItems = COMPANY_POLICIES.map((p) => {
    const key = p.key || p.id
    const consent = rawConsents[key] || rawConsents[p.id] || null
    const isDone = Boolean(consent && consent.consented)
    return {
      type: 'policy',
      id: key,
      title: p.title,
      category: p.category || 'Company Policy',
      badge: p.badge || 'Mandatory',
      description: p.description,
      isDone,
      statusLabel: isDone ? 'Done' : 'Pending',
      timestamp: consent?.consentedDateFormatted || (consent?.consentedAt ? new Date(consent.consentedAt).toLocaleString() : null),
      signedBy: consent?.consentedBy || employee.name,
      employeeId: consent?.employeeId || employee.employeeId,
      previewUrl: p.downloadUrl,
      fileName: p.fileName,
    }
  })

  // 2. Compliance & NDA Agreements Data
  const complianceDocs = employee.complianceDocs || employee.onboardingDocs?.complianceDocs || employee.onboardingDocs || {}
  const qmsTemplate = OFFICIAL_COMPANY_DOCUMENTS.find((d) => d.id === 'qms_framework' || d.key === 'complianceQms')

  const ndaTemplatesCombined = [
    ...COMPLIANCE_AND_NDA_TEMPLATES,
    ...(qmsTemplate ? [{
      key: 'complianceQms',
      id: 'compliance_qms',
      title: qmsTemplate.title,
      fileName: qmsTemplate.fileName,
      downloadUrl: qmsTemplate.downloadUrl,
      badge: 'Quality Assurance',
      category: 'Quality Management System',
      description: qmsTemplate.description,
    }] : []),
  ]

  const ndaItems = ndaTemplatesCombined.map((t) => {
    const uploaded = complianceDocs[t.key] || complianceDocs[t.id] || null
    const isDone = Boolean(uploaded && (uploaded.url || uploaded.fileName || uploaded.uploadedAt))
    return {
      type: 'nda',
      id: t.key,
      title: t.title,
      category: t.category || 'Compliance Agreement',
      badge: t.badge || 'Legal Document',
      description: t.description,
      isDone,
      statusLabel: isDone ? 'Done' : 'Pending',
      uploadedFile: uploaded?.fileName || uploaded?.name || (isDone ? 'Document Uploaded' : null),
      uploadDate: uploaded?.uploadedAt ? new Date(uploaded.uploadedAt).toLocaleDateString() : null,
      previewUrl: uploaded?.url || t.downloadUrl,
      templateUrl: t.downloadUrl,
      fileName: uploaded?.fileName || t.fileName,
      isEmployeeUploaded: Boolean(uploaded?.url),
    }
  })

  // 3. Verification & Statutory Forms Data
  const onboardingDocs = employee.onboardingDocs || {}
  const verificationItems = VERIFICATION_TEMPLATES.map((v) => {
    const doc = onboardingDocs[v.key] || null
    const isUploaded = Boolean(doc && (doc.url || doc.fileName || doc.submittedAt))
    const isVerified = Boolean(doc && doc.status === 'verified')
    const isDone = isUploaded
    return {
      type: 'verification',
      id: v.key,
      title: v.title,
      category: v.category || 'Verification Form',
      badge: v.badge || 'HR Statutory',
      description: v.description,
      isDone,
      isVerified,
      statusLabel: isVerified ? 'Verified' : isDone ? 'Done' : 'Pending',
      uploadedFile: doc?.fileName || (isDone ? 'Form Submitted' : null),
      uploadDate: doc?.submittedAt ? new Date(doc.submittedAt).toLocaleDateString() : null,
      previewUrl: doc?.url || v.downloadUrl,
      fileName: doc?.fileName || v.fileName,
      isEmployeeUploaded: Boolean(doc?.url),
    }
  })

  // Combined lists & counts
  const allItems = [...policyItems, ...ndaItems, ...verificationItems]

  const totalPolicies = policyItems.length
  const completedPolicies = policyItems.filter((i) => i.isDone).length

  const totalNda = ndaItems.length
  const completedNda = ndaItems.filter((i) => i.isDone).length

  const totalVerification = verificationItems.length
  const completedVerification = verificationItems.filter((i) => i.isDone).length

  const totalRequired = allItems.length
  const totalCompleted = allItems.filter((i) => i.isDone).length
  const totalPending = totalRequired - totalCompleted
  const percentComplete = Math.round((totalCompleted / (totalRequired || 1)) * 100)

  // Filter items based on activeTab and filterStatus
  const currentTabItems =
    activeTab === 'policies'
      ? policyItems
      : activeTab === 'nda'
      ? ndaItems
      : activeTab === 'verification'
      ? verificationItems
      : allItems

  const filteredItems = currentTabItems.filter((item) => {
    if (filterStatus === 'done') return item.isDone
    if (filterStatus === 'pending') return !item.isDone
    return true
  })

  return (
    <div
      className="panel"
      style={{
        padding: '24px',
        borderRadius: '12px',
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        marginTop: '20px',
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
              color: '#ffffff',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 4px 8px rgba(13, 148, 136, 0.25)',
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                Policy Consent, Document Policy & NDA Status
              </h3>
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                }}
              >
                HR & Admin Only View
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
              Compliance tracking and legal policy consent record for <strong>{employee.name}</strong> ({employee.employeeId || 'ID Pending'})
            </p>
          </div>
        </div>

        {/* Global Compliance Health Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            background: percentComplete === 100 ? '#f0fdf4' : percentComplete > 50 ? '#fffbeb' : '#fef2f2',
            border: `1px solid ${percentComplete === 100 ? '#86efac' : percentComplete > 50 ? '#fde68a' : '#fecaca'}`,
          }}
        >
          {percentComplete === 100 ? (
            <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
          ) : (
            <AlertCircle size={18} style={{ color: percentComplete > 50 ? '#d97706' : '#dc2626' }} />
          )}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: percentComplete === 100 ? '#15803d' : percentComplete > 50 ? '#b45309' : '#b91c1c' }}>
              {percentComplete === 100 ? '100% Fully Compliant' : `${totalCompleted} of ${totalRequired} Done (${percentComplete}%)`}
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748b' }}>
              {totalPending > 0 ? `${totalPending} items pending completion` : 'All policies & agreements signed'}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {/* Card 1: Policy Consents */}
        <div
          onClick={() => setActiveTab('policies')}
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            background: activeTab === 'policies' ? '#f0fdfa' : '#f8fafc',
            border: activeTab === 'policies' ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Policy Consents</span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '6px',
                background: completedPolicies === totalPolicies ? '#dcfce7' : '#fef3c7',
                color: completedPolicies === totalPolicies ? '#15803d' : '#b45309',
              }}
            >
              {completedPolicies === totalPolicies ? 'Done' : `${totalPolicies - completedPolicies} Pending`}
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            {completedPolicies} / {totalPolicies}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Code of conduct, attendance, sales & zero tolerance
          </div>
        </div>

        {/* Card 2: Compliance & NDA */}
        <div
          onClick={() => setActiveTab('nda')}
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            background: activeTab === 'nda' ? '#f0fdfa' : '#f8fafc',
            border: activeTab === 'nda' ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Compliance & NDA</span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '6px',
                background: completedNda === totalNda ? '#dcfce7' : '#fef3c7',
                color: completedNda === totalNda ? '#15803d' : '#b45309',
              }}
            >
              {completedNda === totalNda ? 'Done' : `${totalNda - completedNda} Pending`}
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            {completedNda} / {totalNda}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Employee NDA, IP Assignment, Cybersecurity & QMS
          </div>
        </div>

        {/* Card 3: Verification Forms */}
        <div
          onClick={() => setActiveTab('verification')}
          style={{
            padding: '14px 16px',
            borderRadius: '10px',
            background: activeTab === 'verification' ? '#f0fdfa' : '#f8fafc',
            border: activeTab === 'verification' ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Verification Forms</span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '6px',
                background: completedVerification === totalVerification ? '#dcfce7' : '#fef3c7',
                color: completedVerification === totalVerification ? '#15803d' : '#b45309',
              }}
            >
              {completedVerification === totalVerification ? 'Done' : `${totalVerification - completedVerification} Pending`}
            </span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
            {completedVerification} / {totalVerification}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Database, BGV undertaking, IRF, Court & Guardian forms
          </div>
        </div>
      </div>

      {/* Tabs and Filter Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Requirements (${allItems.length})` },
            { id: 'policies', label: `Company Policies (${completedPolicies}/${totalPolicies})` },
            { id: 'nda', label: `Compliance & NDA (${completedNda}/${totalNda})` },
            { id: 'verification', label: `Verification Forms (${completedVerification}/${totalVerification})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontSize: '11.5px',
                fontWeight: activeTab === tab.id ? 700 : 500,
                padding: '6px 12px',
                borderRadius: '8px',
                border: activeTab === tab.id ? '1px solid #0d9488' : '1px solid #e2e8f0',
                background: activeTab === tab.id ? '#0d9488' : '#ffffff',
                color: activeTab === tab.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status Filter (All / Done / Pending) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>Filter:</span>
          {['all', 'done', 'pending'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              style={{
                fontSize: '11px',
                fontWeight: filterStatus === st ? 700 : 500,
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid',
                borderColor:
                  filterStatus === st
                    ? st === 'done'
                      ? '#16a34a'
                      : st === 'pending'
                      ? '#d97706'
                      : '#0f172a'
                    : '#cbd5e1',
                background:
                  filterStatus === st
                    ? st === 'done'
                      ? '#dcfce7'
                      : st === 'pending'
                      ? '#fef3c7'
                      : '#0f172a'
                    : '#ffffff',
                color:
                  filterStatus === st
                    ? st === 'done'
                      ? '#15803d'
                      : st === 'pending'
                      ? '#b45309'
                      : '#ffffff'
                    : '#475569',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Requirement Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '16px',
              borderRadius: '10px',
              border: item.isDone ? '1px solid #86efac' : '1px solid #cbd5e1',
              background: item.isDone ? '#fbfdfb' : '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div>
              {/* Card Header & Badges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: '4px',
                    background: '#f1f5f9',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px',
                  }}
                >
                  {item.category}
                </span>

                {/* Status Indicator (DONE vs PENDING) */}
                {item.isDone ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #86efac',
                    }}
                  >
                    <CheckCircle2 size={13} /> Done
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                    }}
                  >
                    <Clock size={13} /> Pending
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h4 style={{ margin: '0 0 6px', fontSize: '13.5px', fontWeight: 700, color: '#0f172a', lineHeight: 1.4 }}>
                {item.title}
              </h4>
              <p style={{ margin: '0 0 10px', fontSize: '11.5px', color: '#64748b', lineHeight: 1.4 }}>
                {item.description}
              </p>

              {/* Status Details Box */}
              {item.isDone ? (
                <div
                  style={{
                    padding: '8px 10px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#166534',
                    display: 'grid',
                    gap: '3px',
                  }}
                >
                  {item.type === 'policy' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar size={12} />
                        <span>Consented: <strong>{item.timestamp || 'Recorded'}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <User size={12} />
                        <span>Signed by: <strong>{item.signedBy}</strong> ({item.employeeId})</span>
                      </div>
                    </>
                  )}
                  {item.type !== 'policy' && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FileText size={12} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          Uploaded: <strong>{item.uploadedFile}</strong>
                        </span>
                      </div>
                      {item.uploadDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={12} />
                          <span>Submitted: <strong>{item.uploadDate}</strong></span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    padding: '8px 10px',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#92400e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={13} style={{ flexShrink: 0, color: '#d97706' }} />
                  <span>
                    {item.type === 'policy'
                      ? 'Employee has not yet submitted digital acknowledgment.'
                      : 'Signed document has not been uploaded by the employee.'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '8px',
                paddingTop: '10px',
                borderTop: '1px solid #f1f5f9',
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setViewingModal({
                    title: item.title,
                    url: item.previewUrl,
                    fileName: item.fileName,
                    isDone: item.isDone,
                    isEmployeeUploaded: item.isEmployeeUploaded,
                  })
                }
                className="ui-button secondary"
                style={{
                  flex: 1,
                  fontSize: '11.5px',
                  padding: '6px 10px',
                  justifyContent: 'center',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Eye size={13} /> {item.isEmployeeUploaded ? 'View Uploaded Copy' : 'View Policy / Template'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Online Document Viewer Modal (No Download Button for policies/company docs) */}
      {viewingModal && (
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
          onClick={() => setViewingModal(null)}
        >
          <div
            className="panel"
            style={{
              width: '95%',
              maxWidth: '920px',
              height: '88vh',
              display: 'flex',
              flexDirection: 'column',
              background: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} style={{ color: '#38bdf8' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                    {viewingModal.title}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {viewingModal.fileName || 'Online Document Preview'} ·{' '}
                    {viewingModal.isDone ? '✓ Completed Record' : 'Pending Action'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setViewingModal(null)}
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

            {/* Embedded Document iframe or image */}
            <div style={{ flex: 1, background: '#525659', position: 'relative' }}>
              {viewingModal.url && viewingModal.url.startsWith('data:image/') ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'grid', placeItems: 'center', padding: '20px' }}>
                  <img src={viewingModal.url} alt={viewingModal.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <iframe
                  src={`${viewingModal.url}#toolbar=0&navpanes=0`}
                  title={viewingModal.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Official HR Compliance & Audit Record
              </span>
              <button
                type="button"
                className="ui-button secondary"
                onClick={() => setViewingModal(null)}
                style={{ fontSize: '12px', padding: '6px 14px' }}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
