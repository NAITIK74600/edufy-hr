import React, { useState, useEffect, useRef } from 'react'
import {
  Building2,
  FileText,
  Download,
  Eye,
  Upload,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  RotateCcw,
  AlertCircle,
  X,
  Search,
  ExternalLink,
  FileCheck2,
} from 'lucide-react'
import {
  OFFICIAL_COMPANY_DOCUMENTS,
  COMPLIANCE_AND_NDA_TEMPLATES,
} from '../constants/companyDocumentsConstants'
import { hrStore } from '../services/hrStore'
import { useAuth } from '../auth/AuthContext'

/**
 * Company Documents & Compliance / NDA Suite
 * Features 2 clear sections:
 * 1. Company Documents (MCA, Udyam, Startup India, Incorporation/PAN)
 * 2. Compliance & NDA (Download blank template, Sign, Re-upload signed copy)
 */
export function CompanyDocumentsView({ employee: propEmployee, user: propUser }) {
  const { user: authUser } = useAuth()
  const user = propUser || authUser
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [activeSection, setActiveSection] = useState('company_docs') // 'company_docs' | 'compliance_nda'
  const [searchTerm, setSearchTerm] = useState('')
  const [viewingPdf, setViewingPdf] = useState(null)
  const [uploadingKey, setUploadingKey] = useState(null)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const userRoleNormalized = String(user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_')
  const isStaffRole = ['hr', 'admin', 'superadmin'].includes(userRoleNormalized)

  // Resolve current active employee
  const currentEmployee = propEmployee || storeState.employees.find((emp) =>
    (user?.id && (emp.id === user.id || emp._id === user.id || emp.userId === user.id)) ||
    (user?.employeeId && (emp.employeeId === user.employeeId || emp.id === user.employeeId)) ||
    (user?.email && emp.email && String(user.email).trim().toLowerCase() === String(emp.email).trim().toLowerCase())
  ) || (!isStaffRole ? storeState.employees[0] : null)

  const isOwnEmployee = Boolean(
    currentEmployee && user && (
      (user.id && (currentEmployee.id === user.id || currentEmployee._id === user.id || currentEmployee.userId === user.id)) ||
      (user.employeeId && (currentEmployee.employeeId === user.employeeId || currentEmployee.id === user.employeeId)) ||
      (user.email && currentEmployee.email && String(user.email).trim().toLowerCase() === String(currentEmployee.email).trim().toLowerCase())
    )
  )

  const canUploadSigned = isOwnEmployee || !isStaffRole

  // Extract compliance documents uploaded by this employee
  const complianceDocs = currentEmployee?.complianceDocs || currentEmployee?.onboardingDocs?.complianceDocs || {}

  // Calculate stats
  const totalNdaTemplates = COMPLIANCE_AND_NDA_TEMPLATES.length
  const uploadedNdaCount = COMPLIANCE_AND_NDA_TEMPLATES.filter((t) => {
    const doc = complianceDocs[t.key]
    return Boolean(doc?.url || doc?.fileName || doc?.status === 'submitted')
  }).length
  const allNdaCompleted = uploadedNdaCount === totalNdaTemplates

  // Handle uploading of signed compliance / NDA document
  const handleUploadSignedDoc = async (template, file) => {
    if (!canUploadSigned || !currentEmployee) {
      setFeedback('Only the employee or account owner can upload signed compliance copies.')
      return
    }
    if (!file) return
    setUploadingKey(template.key)
    setFeedback('')
    try {
      // Read file into Data URL
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve({
          name: file.name,
          fileName: file.name,
          url: e.target.result,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'application/pdf',
          uploadedAt: new Date().toISOString().slice(0, 10),
          uploadedDateFormatted: new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        })
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const empId = currentEmployee?.id || currentEmployee?._id || currentEmployee?.employeeId
      const newDocEntry = {
        ...fileData,
        status: 'submitted',
        title: template.title,
        templateFileName: template.fileName,
        submittedBy: currentEmployee?.name || user?.displayName || 'Employee',
        employeeId: currentEmployee?.employeeId || user?.employeeId,
      }

      const updatedComplianceDocs = {
        ...complianceDocs,
        [template.key]: newDocEntry,
      }

      if (hrStore.updateComplianceDocs) {
        await hrStore.updateComplianceDocs(empId, updatedComplianceDocs)
      } else {
        await hrStore.updateEmployee(empId, {
          complianceDocs: updatedComplianceDocs,
        })
      }

      // Add audit notification (non-blocking)
      try {
        await hrStore.addNotification?.({
          id: `notif-compliance-${Date.now()}`,
          recipientRole: 'hr',
          recipientId: empId,
          type: 'compliance_uploaded',
          title: `Signed Agreement Uploaded: ${template.title}`,
          message: `${currentEmployee?.name || 'Employee'} uploaded signed copy of ${template.title}.`,
          time: 'Just now',
          read: false,
        })
      } catch (notifErr) {
        console.warn('Audit notification skipped:', notifErr)
      }

      setFeedback(`✓ Successfully uploaded signed copy of "${template.title}"!`)
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      console.error('Failed to upload signed compliance document:', err)
      setFeedback('Failed to upload document. Please try again.')
    } finally {
      setUploadingKey(null)
    }
  }

  // Filter lists based on search
  const filteredCompanyDocs = OFFICIAL_COMPANY_DOCUMENTS.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredNdaTemplates = COMPLIANCE_AND_NDA_TEMPLATES.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {/* Page Header */}
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
            <Building2 size={13} /> OFFICIAL CORPORATE REPOSITORY
          </div>
          <h2 style={{ margin: '0 0 6px', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
            Company Documents & Compliance / NDA Suite
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#c5e2e4', maxWidth: '680px', lineHeight: 1.5 }}>
            Access official company registration certificates, download mandatory compliance and NDA templates, and upload executed signed copies.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.12)', padding: '10px 16px', borderRadius: '10px', textAlign: 'right', border: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: '11px', color: '#b2d9dc', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Compliance Status</div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: allNdaCompleted ? '#86efac' : '#fde047', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            {allNdaCompleted ? <CheckCircle2 size={17} /> : <Clock size={17} />}
            {uploadedNdaCount} of {totalNdaTemplates} NDA / Compliance Uploaded
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{ padding: '12px 16px', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', borderRadius: '10px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} style={{ color: '#059669', flexShrink: 0 }} />
          <span>{feedback}</span>
        </div>
      )}

      {/* 2-Section Nav Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveSection('company_docs')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeSection === 'company_docs' ? '1px solid var(--teal)' : '1px solid #cbd5e1',
              background: activeSection === 'company_docs' ? 'var(--teal)' : '#ffffff',
              color: activeSection === 'company_docs' ? '#ffffff' : '#334155',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeSection === 'company_docs' ? '0 2px 8px rgba(0, 110, 111, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Building2 size={15} />
            <span>1. Company Documents</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: activeSection === 'company_docs' ? 'rgba(255,255,255,0.25)' : '#e2e8f0', color: activeSection === 'company_docs' ? '#ffffff' : '#475569' }}>
              {OFFICIAL_COMPANY_DOCUMENTS.length} Official
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('compliance_nda')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              border: activeSection === 'compliance_nda' ? '1px solid var(--teal)' : '1px solid #cbd5e1',
              background: activeSection === 'compliance_nda' ? 'var(--teal)' : '#ffffff',
              color: activeSection === 'compliance_nda' ? '#ffffff' : '#334155',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeSection === 'compliance_nda' ? '0 2px 8px rgba(0, 110, 111, 0.25)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <FileCheck2 size={15} />
            <span>2. Compliance & NDA</span>
            <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: activeSection === 'compliance_nda' ? (allNdaCompleted ? '#15803d' : 'rgba(255,255,255,0.25)') : (allNdaCompleted ? '#dcfce7' : '#fee2e2'), color: activeSection === 'compliance_nda' ? '#ffffff' : (allNdaCompleted ? '#166534' : '#991b1b') }}>
              {uploadedNdaCount} / {totalNdaTemplates} Attached
            </span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            className="ui-input"
            placeholder="Search documents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '32px', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: COMPANY DOCUMENTS */}
      {/* ============================================================== */}
      {activeSection === 'company_docs' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Official Corporate Registration & Legal Filings
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                Statutory registration certificates issued by the Ministry of Corporate Affairs, MSME, Startup India, and Income Tax Department.
              </p>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--teal)', background: '#f0fdfa', padding: '4px 10px', borderRadius: '8px', border: '1px solid #ccfbf1' }}>
              Verified Corporate Records
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredCompanyDocs.map((doc) => (
              <div
                key={doc.id}
                className="panel"
                style={{
                  padding: '20px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#fee2e2', color: '#b91c1c' }}>
                      {doc.fileType} • {doc.sizeLabel}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: '#f1f5f9', color: '#475569' }}>
                      {doc.badge}
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <Building2 size={18} style={{ color: 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
                    <span>{doc.title}</span>
                  </h4>

                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
                    {doc.description}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                  <button
                    type="button"
                    onClick={() => setViewingPdf({ ...doc, isCompanyDoc: true })}
                    className="ui-button secondary"
                    style={{ flex: 1, fontSize: '11.5px', padding: '8px 12px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Eye size={13} /> Read / Preview Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION 2: COMPLIANCE & NDA (DOWNLOAD & RE-UPLOAD WORKFLOW) */}
      {/* ============================================================== */}
      {activeSection === 'compliance_nda' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Header Locker Status Card */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: allNdaCompleted
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: allNdaCompleted ? '1px solid #86efac' : '1px solid #cbd5e1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: allNdaCompleted ? '#15803d' : '#0284c7',
                    color: '#ffffff',
                    letterSpacing: '0.3px',
                  }}
                >
                  {allNdaCompleted ? <CheckCircle2 size={12} /> : <FileCheck2 size={12} />}
                  {allNdaCompleted ? 'ALL COMPLIANCE & NDA ATTACHED' : 'MANDATORY EMPLOYEE EXECUTION'}
                </span>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  {uploadedNdaCount} of {totalNdaTemplates} Agreements Uploaded
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Download Agreement Templates, Sign, and Re-upload Signed Copies
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569', maxWidth: '780px', lineHeight: '1.5' }}>
                Download each official blank agreement template below, review the clauses, physically or digitally sign the document, and re-upload your executed signed copy. Each attached agreement is verified and permanently secured in your employee compliance locker.
              </p>
            </div>
          </div>

          {/* Cards for each of the 4 Compliance & NDA agreements */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
            {filteredNdaTemplates.map((template) => {
              const uploadedDoc = complianceDocs[template.key]
              const isUploaded = Boolean(uploadedDoc?.url || uploadedDoc?.fileName || uploadedDoc?.status === 'submitted')
              const isUploading = uploadingKey === template.key

              return (
                <ComplianceNdaCard
                  key={template.key}
                  template={template}
                  uploadedDoc={uploadedDoc}
                  isUploaded={isUploaded}
                  isUploading={isUploading}
                  canUpload={canUploadSigned}
                  onViewTemplate={() => setViewingPdf(template)}
                  onViewUploaded={() => setViewingPdf({ ...uploadedDoc, title: `Signed: ${template.title}` })}
                  onUploadFile={(file) => handleUploadSignedDoc(template, file)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Embedded PDF Viewer Modal */}
      {viewingPdf && (
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
          onClick={() => setViewingPdf(null)}
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
                <FileText size={20} style={{ color: '#38bdf8' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                    {viewingPdf.title}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {viewingPdf.fileName || 'Document Viewer'} • {viewingPdf.sizeLabel || viewingPdf.size || 'PDF'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {viewingPdf.downloadUrl && activeSection !== 'company_docs' && !viewingPdf.isCompanyDoc && (
                  <a
                    href={viewingPdf.downloadUrl}
                    download={viewingPdf.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-button secondary"
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      borderColor: 'rgba(255,255,255,0.25)',
                      color: '#ffffff',
                      fontSize: '11.5px',
                      padding: '6px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={13} /> Download
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setViewingPdf(null)}
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

            {/* Embedded PDF iframe / image viewer */}
            <div style={{ flex: 1, background: '#525659', position: 'relative' }}>
              {viewingPdf.url && viewingPdf.url.startsWith('data:image/') ? (
                <div style={{ width: '100%', height: '100%', overflow: 'auto', display: 'grid', placeItems: 'center', padding: '20px' }}>
                  <img src={viewingPdf.url} alt={viewingPdf.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <iframe
                  src={`${viewingPdf.url || viewingPdf.downloadUrl}#toolbar=${activeSection === 'company_docs' || viewingPdf.isCompanyDoc ? '0' : '1'}&navpanes=0`}
                  title={viewingPdf.title}
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
                Official compliance record of Elythra Edufyi Tech Solutions
              </span>
              <button
                type="button"
                className="ui-button secondary"
                onClick={() => setViewingPdf(null)}
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

/**
 * Individual Card for each Compliance & NDA agreement
 * Implements the Download Blank -> Sign -> Re-upload workflow
 */
function ComplianceNdaCard({
  template,
  uploadedDoc,
  isUploaded,
  isUploading,
  onViewTemplate,
  onViewUploaded,
  onUploadFile,
  canUpload = true,
}) {
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      onUploadFile(file)
    }
  }

  return (
    <div
      className="panel"
      style={{
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        border: isUploaded ? '1px solid #86efac' : '1px solid #cbd5e1',
        background: isUploaded ? '#fbfdfb' : '#ffffff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
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
            {template.fileType} • {template.sizeLabel}
          </span>

          {isUploaded ? (
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
              <CheckCircle2 size={11} /> SIGNED & ATTACHED
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
              <Clock size={11} /> PENDING SIGNED UPLOAD
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h4 style={{ margin: '0 0 8px', fontSize: '15px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
          <FileCheck2 size={18} style={{ color: isUploaded ? '#16a34a' : 'var(--teal)', flexShrink: 0, marginTop: '2px' }} />
          <span>{template.title}</span>
        </h4>

        <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
          {template.description}
        </p>

        {/* Status Callout Box */}
        {isUploaded ? (
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
              <span>Signed Copy Uploaded & Secured</span>
            </div>
            <div style={{ fontSize: '10.5px', color: '#15803d' }}>
              File: <strong>{uploadedDoc?.fileName || 'Signed Agreement'}</strong> ({uploadedDoc?.size || 'Attached'})
            </div>
            <div style={{ fontSize: '10px', color: '#166534' }}>
              Uploaded on: {uploadedDoc?.uploadedDateFormatted || uploadedDoc?.uploadedAt || 'Recently'}
            </div>
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
            <span>Step 1: Download blank template below. Step 2: Sign and re-upload completed copy.</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
        {/* Template Downloads & Previews */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={onViewTemplate}
            className="ui-button secondary"
            style={{ flex: 1, fontSize: '11.5px', padding: '7px 10px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Eye size={13} /> View Template
          </button>
          <a
            href={template.downloadUrl}
            download={template.fileName}
            target="_blank"
            rel="noopener noreferrer"
            className="ui-button secondary"
            style={{ flex: 1, fontSize: '11.5px', padding: '7px 10px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}
          >
            <Download size={13} /> Download Blank
          </a>
        </div>

        {/* Upload Action */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {isUploaded ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onViewUploaded}
              className="ui-button secondary"
              style={{ flex: 1, fontSize: '11.5px', padding: '7px 10px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46', fontWeight: 600 }}
            >
              <Eye size={13} /> View Signed Copy
            </button>
            {canUpload && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="ui-button secondary"
                style={{ fontSize: '11.5px', padding: '7px 12px', justifyContent: 'center', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <Upload size={13} /> {isUploading ? 'Uploading...' : 'Re-upload'}
              </button>
            )}
          </div>
        ) : canUpload ? (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
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
            <Upload size={14} />
            {isUploading ? 'Attaching Document...' : 'Upload Signed Copy'}
          </button>
        ) : null}
      </div>
    </div>
  )
}
