import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { apiClient } from '../services/apiClient'
import {
  FileText,
  Upload,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  AlertCircle,
  Building,
  CreditCard,
  User,
  Users,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
  Edit2,
  X,
  Camera,
  Lock,
  Unlock,
  TrendingUp,
  DollarSign,
  Check,
  Calendar,
  Briefcase,
  Send,
  Layers,
  RotateCcw,
} from 'lucide-react'
import { hrStore } from '../services/hrStore'
import { useAuth } from '../auth/AuthContext'
import { unmaskBankAccount } from '../utils/payrollMatcher'

import { VERIFICATION_TEMPLATES } from '../constants/verificationConstants.js'

export function safeEmergencyContact(val) {
  if (!val || typeof val !== 'object') return { name: '', relationship: '', phone: '' }
  const rawPhone = typeof val.phone === 'string' ? val.phone.replace(/[^0-9+\s\-()]/g, '').trim() : ''
  const hasDigits = /\d/.test(rawPhone)
  return {
    name: typeof val.name === 'string' ? val.name.trim() : '',
    relationship: typeof val.relationship === 'string' ? val.relationship.trim() : '',
    phone: hasDigits ? rawPhone : '',
  }
}

export function safeParentsContact(val) {
  if (!val || typeof val !== 'object') return { fatherName: '', motherName: '', parentPhone: '', address: '' }
  const rawPhone = String(val.parentPhone || val.phone || '').replace(/[^0-9+\s\-()]/g, '').trim()
  const hasDigits = /\d/.test(rawPhone)
  return {
    fatherName: typeof val.fatherName === 'string' ? val.fatherName.trim() : '',
    motherName: typeof val.motherName === 'string' ? val.motherName.trim() : '',
    parentPhone: hasDigits ? rawPhone : '',
    phone: hasDigits ? rawPhone : '',
    address: typeof val.address === 'string' ? val.address.trim() : '',
  }
}


function ModalDocInput({ doc, currentDoc, onSelect }) {
  const hasFile = Boolean(
    currentDoc && (
      currentDoc.url ||
      currentDoc.fileName ||
      (Array.isArray(currentDoc.files) && currentDoc.files.length > 0)
    )
  )
  const isReuploadRequested = Boolean(
    currentDoc && (
      currentDoc.reuploadRequested === true ||
      currentDoc.status === 'reupload_requested' ||
      currentDoc.status === 'rejected'
    )
  )
  const isVerified = currentDoc?.status === 'verified'
  const fileName = Array.isArray(currentDoc?.files) && currentDoc.files.length > 1
    ? `${currentDoc.files.length} files attached (${currentDoc.files.map((f) => f.name).join(', ')})`
    : (currentDoc?.fileName || (hasFile ? 'Document Attached' : ''))

  return (
    <div
      style={{
        padding: '12px 14px',
        border: isReuploadRequested
          ? '1.5px solid #fca5a5'
          : hasFile
          ? '1.5px solid #a7f3d0'
          : '1px solid #e2e8f0',
        borderRadius: '10px',
        background: isReuploadRequested
          ? '#fef2f2'
          : hasFile
          ? '#f0fdf4'
          : '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '9px',
        boxSizing: 'border-box',
        transition: 'all 0.18s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b', display: 'block' }}>
            {doc.label} {doc.multiple ? '(Multiple Files Allowed)' : ''}
          </span>
          <small style={{ color: '#64748b', fontSize: '10.5px' }}>
            {doc.category === 'photo' ? 'Photo / Headshot (JPEG, PNG)' : doc.multiple ? 'PDF, PNG, JPG (select multiple)' : 'PDF, JPG, PNG'}
          </small>
        </div>
        {isReuploadRequested ? (
          <span style={{ fontSize: '9.5px', padding: '2px 6px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, flexShrink: 0 }}>
            RE-UPLOAD
          </span>
        ) : isVerified ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '2px 7px', borderRadius: '4px', flexShrink: 0 }}>
            <CheckCircle2 size={11} /> VERIFIED
          </span>
        ) : hasFile ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '9.5px', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '2px 7px', borderRadius: '4px', flexShrink: 0 }}>
            <Check size={11} /> ATTACHED
          </span>
        ) : null}
      </div>

      {isReuploadRequested && (currentDoc?.reuploadRemarks || currentDoc?.rejectionReason) && (
        <div style={{ padding: '5px 8px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '5px', fontSize: '10.5px', color: '#991b1b' }}>
          <strong>HR Note:</strong> {currentDoc.reuploadRemarks || currentDoc.rejectionReason}
        </div>
      )}

      {hasFile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#065f46', background: 'rgba(255, 255, 255, 0.85)', padding: '6px 9px', borderRadius: '6px', border: '1px solid #bbf7d0', overflow: 'hidden' }}>
          <FileText size={13} style={{ flexShrink: 0, color: '#059669' }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, flex: 1 }}>
            {fileName}
          </span>
          {currentDoc?.size && (
            <span style={{ fontSize: '9.5px', color: '#047857', flexShrink: 0 }}>
              {currentDoc.size}
            </span>
          )}
        </div>
      )}

      <div>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: '7px 12px',
            borderRadius: '7px',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            border: hasFile ? '1px solid #86efac' : '1px solid #cbd5e1',
            background: hasFile ? '#ffffff' : '#f8fafc',
            color: hasFile ? '#047857' : '#334155',
            boxSizing: 'border-box',
            transition: 'background 0.15s ease',
          }}
        >
          <Upload size={13} />
          <span>{hasFile ? 'Replace Document' : 'Choose File'}</span>
          <input
            type="file"
            accept="*/*"
            multiple={Boolean(doc.multiple)}
            style={{ display: 'none' }}
            onChange={(e) => {
              onSelect(doc.key, e)
              try { e.target.value = '' } catch (_) {}
            }}
          />
        </label>
      </div>
    </div>
  )
}

export function OnboardingDossierView({ employee, canEdit = false, canVerify = false, onUpdated, initialTab = 'verification' }) {
  const { user } = useAuth()
  const userRoleNormalized = String(user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_')
  const isSelf = Boolean(
    user && employee && (
      String(user.id) === String(employee.id || employee._id) ||
      String(user._id) === String(employee.id || employee._id) ||
      (user.employeeId && employee.employeeId && String(user.employeeId).toUpperCase() === String(employee.employeeId).toUpperCase()) ||
      (user.email && employee.email && user.email.toLowerCase() === employee.email.toLowerCase())
    )
  )

  const isEmployeePortal = typeof window !== 'undefined' && window.location.hash.startsWith('#/employee')
  const isDirectorOrHR = ['admin', 'hr', 'director', 'managing_director', 'co_founder', 'hr_executive', 'vertical_head'].includes(userRoleNormalized)

  // Document verification is STRICTLY reserved for Director/HR/Admin reviewing OTHER employees' files
  const canVerifyDocs = Boolean(canVerify) && isDirectorOrHR && !isSelf && !isEmployeePortal
  const isHRorAdmin = canVerifyDocs
  const isSelfServiceUser = !canVerifyDocs

  // Employees, Managers, HR, and Directors can upload their initial compliance documents ONLY on their OWN profile
  const canUpload = (Boolean(canEdit) || isSelf || isEmployeePortal) && !canVerifyDocs

  const [activeTab, setActiveTab] = useState(initialTab || 'verification')

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])
  const [viewingDoc, setViewingDoc] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingFinance, setSavingFinance] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [localDocOverrides, setLocalDocOverrides] = useState({})
  const [rejectionReason, setRejectionReason] = useState('')
  const [employeeRevisionModal, setEmployeeRevisionModal] = useState(false)
  const [revisionRequestNote, setRevisionRequestNote] = useState('')
  const [localDocs, setLocalDocs] = useState({})
  const [localStatus, setLocalStatus] = useState(null)

  // Keep local state in sync when employee prop updates
  useEffect(() => {
    if (employee?.onboardingDocs) {
      setLocalDocs((prev) => ({ ...employee.onboardingDocs, ...prev }))
    }
    if (employee?.onboardingStatus) {
      setLocalStatus(employee.onboardingStatus)
    }
  }, [employee?.onboardingDocs, employee?.onboardingStatus])

  // Close modals on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (rejectModal) setRejectModal(null)
        if (employeeRevisionModal) setEmployeeRevisionModal(false)
        if (viewingDoc) setViewingDoc(null)
        if (isEditing) setIsEditing(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewingDoc, isEditing, rejectModal, employeeRevisionModal])

  const identity = employee?.identity || {}
  const parents = safeParentsContact(employee?.parentsContact)
  const emergency = safeEmergencyContact(employee?.emergencyContact)
  const bank = employee?.bankDetails || {}
  const rawDocs = { ...(employee?.onboardingDocs || {}), ...localDocs }
  const docs = {
    ...rawDocs,
    aadharCard: rawDocs.aadharCard || rawDocs.aadharDoc || rawDocs.aadhaarCard || rawDocs.aadhaarDoc,
    panCard: rawDocs.panCard || rawDocs.panDoc,
    passport: rawDocs.passport || rawDocs.passportDoc,
    uanCard: rawDocs.uanCard || rawDocs.uanDoc,
    signedOfferLetter: rawDocs.signedOfferLetter || rawDocs.signedOfferLetterDoc || rawDocs.signedOffer,
    cancelledCheque: rawDocs.cancelledCheque || rawDocs.chequeDoc,
    ugMarksheets: rawDocs.ugMarksheets || rawDocs.ugMarksheet,
    pgMarksheets: rawDocs.pgMarksheets || rawDocs.pgMarksheet,
    degreeCertificates: rawDocs.degreeCertificates || rawDocs.degreeCertificate,
    otherAcademicDocs: rawDocs.otherAcademicDocs || rawDocs.otherAcademicDocuments || rawDocs.otherDocuments || rawDocs.otherDocs,
    experienceLetter: rawDocs.experienceLetter || rawDocs.experienceDoc,
    previousPayslip: rawDocs.previousPayslip || rawDocs.previousPayslipDoc || rawDocs.previousBankStatement,
    relievingLetter: rawDocs.relievingLetter || rawDocs.relievingDoc,
    offerLetter: rawDocs.offerLetter || rawDocs.previousOfferLetter || rawDocs.offerDoc,
    verificationDatabaseForm: rawDocs.verificationDatabaseForm || rawDocs.databaseForm,
    verificationBgvUndertaking: rawDocs.verificationBgvUndertaking || rawDocs.bgvUndertaking,
    verificationIrfForm: rawDocs.verificationIrfForm || rawDocs.irfForm,
    verificationAddressCourtForm: rawDocs.verificationAddressCourtForm || rawDocs.addressCourtForm,
    verificationGuardianDeclaration: rawDocs.verificationGuardianDeclaration || rawDocs.guardianDeclaration,
  }
  const finance = employee?.financeDetails || {}

  const onboardingStatus = localStatus || (employee?.onboardingStatus === 'pending' ? 'draft' : (employee?.onboardingStatus || 'draft'))
  const isVerified = onboardingStatus === 'verified'
  const isSubmitted = onboardingStatus === 'submitted'
  const isRevisionRequested = onboardingStatus === 'revision_requested'
  const isLockedForEmployee = false // Unlocked: employee can always request revision, update details, and upload

  // Edit form state
  const [editData, setEditData] = useState({
    identity: {
      aadharNumber: identity.aadharNumber || '',
      panNumber: identity.panNumber || '',
      passportNumber: identity.passportNumber || '',
      uanNumber: identity.uanNumber || '',
      hasExistingUan: identity.hasExistingUan ?? Boolean(identity.uanNumber),
      dob: employee?.dob ? String(employee.dob).slice(0, 10) : (identity.dob ? String(identity.dob).slice(0, 10) : ''),
    },
    dob: employee?.dob ? String(employee.dob).slice(0, 10) : (identity.dob ? String(identity.dob).slice(0, 10) : ''),
    parentsContact: safeParentsContact(employee?.parentsContact || parents),
    emergencyContact: safeEmergencyContact(employee?.emergencyContact || emergency),
    bankDetails: {
      bankName: bank.bankName || '',
      accountNumber: bank.accountNumber || '',
      ifscCode: bank.ifscCode || '',
      accountHolderName: bank.accountHolderName || employee?.name || '',
    },
    onboardingDocs: { ...docs },
  })

  // Keep editData populated and synced with current employee record
  useEffect(() => {
    if (employee) {
      setEditData((prev) => ({
        identity: {
          aadharNumber: employee.identity?.aadharNumber || prev.identity?.aadharNumber || '',
          panNumber: employee.identity?.panNumber || prev.identity?.panNumber || '',
          passportNumber: employee.identity?.passportNumber || prev.identity?.passportNumber || '',
          uanNumber: employee.identity?.uanNumber || prev.identity?.uanNumber || '',
          hasExistingUan: employee.identity?.hasExistingUan ?? Boolean(employee.identity?.uanNumber || prev.identity?.uanNumber),
          dob: employee?.dob ? String(employee.dob).slice(0, 10) : (employee.identity?.dob ? String(employee.identity.dob).slice(0, 10) : (prev.identity?.dob || '')),
        },
        dob: employee?.dob ? String(employee.dob).slice(0, 10) : (employee.identity?.dob ? String(employee.identity.dob).slice(0, 10) : (prev.dob || '')),
        parentsContact: safeParentsContact(employee.parentsContact || prev.parentsContact),
        emergencyContact: safeEmergencyContact(employee.emergencyContact || prev.emergencyContact),
        bankDetails: {
          bankName: employee.bankDetails?.bankName || prev.bankDetails?.bankName || '',
          accountNumber: employee.bankDetails?.accountNumber || prev.bankDetails?.accountNumber || '',
          ifscCode: employee.bankDetails?.ifscCode || prev.bankDetails?.ifscCode || '',
          accountHolderName: employee.bankDetails?.accountHolderName || employee?.name || prev.bankDetails?.accountHolderName || '',
        },
        onboardingDocs: {
          ...(employee.onboardingDocs || {}),
          ...(prev.onboardingDocs || {}),
          ...localDocs,
        },
      }))
    }
  }, [employee, isEditing])

  // Prevent background scroll when any modal is open
  useEffect(() => {
    const hasOpenModal = Boolean(viewingDoc || isEditing || rejectModal || employeeRevisionModal)
    if (!hasOpenModal) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [viewingDoc, isEditing, rejectModal, employeeRevisionModal])

  // Finance details state (Always editable by employee)
  const [financeData, setFinanceData] = useState({
    taxRegime: finance.taxRegime || 'new_regime',
    vpfMonthly: finance.vpfMonthly || 0,
    sec80cDeclared: finance.sec80cDeclared || 0,
    sec80dDeclared: finance.sec80dDeclared || 0,
    hraMonthlyRent: finance.hraMonthlyRent || 0,
    landlordPan: finance.landlordPan || '',
    reimbursementAccount: finance.reimbursementAccount || bank.accountNumber || '',
  })

  // Fast client-side image compression & document reader
  // Resizes high-res phone camera photos (> 400KB) to max 1600px dimension and JPEG 0.85
  // This drastically reduces payload size from 10MB+ to ~150-250KB, eliminating browser lag, memory spikes and slow uploads.
  function processFileForUpload(file) {
    if (!file) return Promise.resolve(null)
    
    // Non-image files (PDFs, docs) or small images (< 400KB) read directly
    if (!file.type || !file.type.startsWith('image/') || file.size < 400 * 1024) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve({
          name: file.name,
          fileName: file.name,
          url: ev.target.result,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'application/octet-stream',
          uploadedAt: new Date().toISOString().slice(0, 10),
        })
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    }

    // Compress high-res images using HTML5 Canvas
    return new Promise((resolve) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        const maxDim = 1600
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width)
            width = maxDim
          } else {
            width = Math.round((width * maxDim) / height)
            height = maxDim
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85)
        const approxSizeKb = (compressedDataUrl.length * 0.75 / 1024).toFixed(1)
        resolve({
          name: file.name,
          fileName: file.name,
          url: compressedDataUrl,
          size: `${approxSizeKb} KB`,
          type: 'image/jpeg',
          uploadedAt: new Date().toISOString().slice(0, 10),
        })
      }
      img.onerror = () => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve({
          name: file.name,
          fileName: file.name,
          url: ev.target.result,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: file.type || 'image/jpeg',
          uploadedAt: new Date().toISOString().slice(0, 10),
        })
        reader.onerror = () => resolve({
          name: file.name,
          fileName: file.name,
          url: null,
          size: '0 KB',
          type: file.type,
          uploadedAt: new Date().toISOString().slice(0, 10),
        })
        reader.readAsDataURL(file)
      }
      img.src = objectUrl
    })
  }

  async function handleFileSelect(docKey, e) {
    const rawFiles = Array.from(e.target.files || [])
    if (rawFiles.length === 0) return
    try {
      e.target.value = ''
    } catch (_) {}
    const readFiles = await Promise.all(rawFiles.map((file) => processFileForUpload(file)))

    setEditData((prev) => {
      const existingDoc = prev.onboardingDocs?.[docKey] || {}
      const existingFiles = Array.isArray(existingDoc.files) ? existingDoc.files : (existingDoc.url ? [{ name: existingDoc.fileName || 'Document', url: existingDoc.url, size: existingDoc.size }] : [])
      const allFiles = docKey === 'otherAcademicDocs' ? [...existingFiles, ...readFiles] : readFiles
      const primary = allFiles[0]
      const updatedDocEntry = {
        status: 'submitted',
        url: primary?.url,
        fileName: allFiles.length > 1 ? `${allFiles.length} files attached (${allFiles.map(f => f.name).join(', ')})` : primary?.name,
        files: allFiles,
        size: primary?.size,
        uploadedAt: new Date().toISOString().slice(0, 10),
      }
      return {
        ...prev,
        onboardingDocs: {
          ...prev.onboardingDocs,
          [docKey]: updatedDocEntry,
        },
      }
    })
  }

  // Employee saves onboarding documents & details
  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setFeedback('')

    // Strict Emergency Contact validation & normalization
    const ecName = (editData.emergencyContact?.name || '').trim()
    const ecRel = (editData.emergencyContact?.relationship || '').trim()
    const ecPhone = String(editData.emergencyContact?.phone || '').replace(/[^0-9+\s\-()]/g, '').trim()
    const ecDigits = ecPhone.replace(/\D/g, '')

    if (ecName && ecName.length < 2) {
      setFeedback('Error: Emergency Contact Name must contain at least 2 characters.')
      setSaving(false)
      return
    }
    if (ecPhone && ecDigits.length < 10) {
      setFeedback('Error: Emergency Contact Phone Number must contain at least 10 numerical digits.')
      setSaving(false)
      return
    }

    // Strict Parents Contact Phone validation & normalization
    const pFather = (editData.parentsContact?.fatherName || '').trim()
    const pMother = (editData.parentsContact?.motherName || '').trim()
    const pPhone = String(editData.parentsContact?.parentPhone || editData.parentsContact?.phone || '').replace(/[^0-9+\s\-()]/g, '').trim()
    const pDigits = pPhone.replace(/\D/g, '')
    const pAddress = (editData.parentsContact?.address || '').trim()

    if (pPhone && pDigits.length < 10) {
      setFeedback("Error: Parents' Contact Phone Number must contain at least 10 numerical digits.")
      setSaving(false)
      return
    }

    try {
      const payload = {
        ...editData,
        emergencyContact: {
          name: ecName,
          relationship: ecRel,
          phone: ecDigits.length >= 10 ? ecPhone : '',
        },
        parentsContact: {
          fatherName: pFather,
          motherName: pMother,
          parentPhone: pDigits.length >= 10 ? pPhone : '',
          phone: pDigits.length >= 10 ? pPhone : '',
          address: pAddress,
        },
        onboardingStatus: 'submitted',
        onboardingSubmittedAt: new Date().toISOString(),
      }
      if (!payload.avatarUrl && editData?.onboardingDocs?.passportPhoto?.url) {
        payload.avatarUrl = editData.onboardingDocs.passportPhoto.url
      }

      setLocalStatus('submitted')
      if (editData.onboardingDocs) {
        setLocalDocs((prev) => ({ ...prev, ...editData.onboardingDocs }))
      }

      const empId = employee?.id || employee?._id || employee?.employeeId
      if (isSelf || isEmployeePortal) {
        try {
          await apiClient.patch('/employees/me/onboarding', payload)
          if (hrStore.updateOnboardingDocs) {
            hrStore.updateOnboardingDocs(empId, payload)
          }
        } catch (apiErr) {
          if (hrStore.updateOnboardingDocs) {
            await hrStore.updateOnboardingDocs(empId, payload)
          } else {
            throw apiErr
          }
        }
      } else if (hrStore.updateOnboardingDocs) {
        await hrStore.updateOnboardingDocs(empId, payload)
      } else if (hrStore.updateEmployee) {
        await hrStore.updateEmployee(empId, payload)
      }

      // Notify HR of the update
      hrStore.addNotification({
        id: `notif-onboard-${Date.now()}`,
        type: 'onboarding',
        title: 'Onboarding Verification Required',
        message: `Employee ${employee?.name || 'Employee'} (${employee?.employeeId || 'ID'}) has uploaded/updated onboarding documents. Please review and verify.`,
        time: 'Just now',
        read: false,
      })

      setFeedback('✓ Onboarding details and documents submitted to HR for verification!')
      setIsEditing(false)
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback('Failed to save: ' + (err.message || 'Server error'))
    } finally {
      setSaving(false)
    }
  }

  // Direct Quick File / Media Upload from Document Card (Fast & Optimistic)
  async function handleQuickUpload(docKey, docTitle, fileOrFiles) {
    if (!canUpload) {
      setFeedback('Only the employee or account owner can upload verification files.')
      return
    }
    if (!fileOrFiles) return
    const fileList = fileOrFiles instanceof FileList || Array.isArray(fileOrFiles) ? Array.from(fileOrFiles) : [fileOrFiles]
    if (fileList.length === 0) return

    setSaving(true)
    setFeedback('')
    try {
      const readFiles = await Promise.all(fileList.map((file) => processFileForUpload(file)))

      const existingDoc = docs[docKey] || {}
      const existingFiles = Array.isArray(existingDoc.files) ? existingDoc.files : (existingDoc.url ? [{ name: existingDoc.fileName || 'Document', url: existingDoc.url, size: existingDoc.size }] : [])
      const allFiles = docKey === 'otherAcademicDocs' ? [...existingFiles, ...readFiles] : readFiles
      const primaryFile = allFiles[0]
      const empId = employee?.id || employee?._id || employee?.employeeId

      const updatedDocEntry = {
        status: 'submitted',
        url: primaryFile.url,
        fileName: allFiles.length > 1 ? `${allFiles.length} files attached (${allFiles.map(f => f.name).join(', ')})` : primaryFile.name,
        files: allFiles,
        size: primaryFile.size,
        uploadedAt: new Date().toISOString().slice(0, 10),
        submittedAt: new Date().toISOString(),
      }

      // Instant optimistic local update
      setLocalDocs((prev) => ({
        ...prev,
        [docKey]: updatedDocEntry,
        ...(docKey === 'aadharCard' ? { aadharDoc: updatedDocEntry } : {}),
        ...(docKey === 'panCard' ? { panDoc: updatedDocEntry } : {}),
      }))

      setEditData((prev) => ({
        ...prev,
        onboardingDocs: {
          ...prev.onboardingDocs,
          [docKey]: updatedDocEntry,
        }
      }))

      const updatedDocs = {
        ...rawDocs,
        ...docs,
        [docKey]: updatedDocEntry,
        ...(docKey === 'aadharCard' ? { aadharDoc: updatedDocEntry } : {}),
        ...(docKey === 'panCard' ? { panDoc: updatedDocEntry } : {}),
      }

      const nextStatus = isVerified ? 'revision_requested' : 'submitted'
      setLocalStatus(nextStatus)

      const payload = {
        onboardingDocs: updatedDocs,
        onboardingStatus: nextStatus,
        onboardingSubmittedAt: new Date().toISOString(),
      }

      if (isSelf || isEmployeePortal) {
        try {
          await apiClient.patch('/employees/me/onboarding', payload)
          if (hrStore.updateOnboardingDocs) {
            hrStore.updateOnboardingDocs(empId, payload)
          }
        } catch (apiErr) {
          if (hrStore.updateOnboardingDocs) {
            await hrStore.updateOnboardingDocs(empId, payload)
          } else {
            throw apiErr
          }
        }
      } else if (hrStore.updateOnboardingDocs) {
        await hrStore.updateOnboardingDocs(empId, payload)
      } else if (hrStore.updateEmployee) {
        await hrStore.updateEmployee(empId, payload)
      }

      hrStore.addNotification({
        id: `notif-doc-uploaded-${Date.now()}`,
        type: 'onboarding',
        title: isVerified ? 'Updated Document for Revision' : 'Document Uploaded for Verification',
        message: `Employee ${employee?.name || 'Employee'} uploaded ${docTitle || 'document(s)'} (${allFiles.length > 1 ? `${allFiles.length} files` : primaryFile.name}). Please review and verify.`,
        time: 'Just now',
        read: false,
      })

      setFeedback(`✓ ${docTitle || 'Document'} attached successfully! You can submit to HR when ready.`)
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback('Failed to upload document: ' + (err.message || 'Error'))
    } finally {
      setSaving(false)
    }
  }

  // Employee submits all documents & details to HR for verification
  async function handleSubmitToHR() {
    setSaving(true)
    setFeedback('')
    try {
      const empId = employee?.id || employee?._id || employee?.employeeId
      const updatedDocs = {
        ...rawDocs,
        ...docs,
        ...(editData.onboardingDocs || {}),
        ...localDocs,
      }
      const payload = {
        onboardingDocs: updatedDocs,
        onboardingStatus: 'submitted',
        onboardingSubmittedAt: new Date().toISOString(),
      }
      setLocalStatus('submitted')

      if (isSelf || isEmployeePortal) {
        try {
          await apiClient.patch('/employees/me/onboarding', payload)
          if (hrStore.updateOnboardingDocs) {
            hrStore.updateOnboardingDocs(empId, payload)
          }
        } catch (apiErr) {
          if (hrStore.updateOnboardingDocs) {
            await hrStore.updateOnboardingDocs(empId, payload)
          } else {
            throw apiErr
          }
        }
      } else if (hrStore.updateOnboardingDocs) {
        await hrStore.updateOnboardingDocs(empId, payload)
      } else if (hrStore.updateEmployee) {
        await hrStore.updateEmployee(empId, payload)
      }

      hrStore.addNotification({
        id: `notif-verify-req-${Date.now()}`,
        type: 'onboarding_verification_requested',
        title: 'Onboarding Dossier Submitted to HR',
        message: `Employee ${employee?.name || 'Employee'} (${employee?.employeeId || 'ID'}) has submitted their complete onboarding dossier and statutory documents for HR verification.`,
        time: 'Just now',
        read: false,
      })

      setFeedback('✓ Successfully submitted to HR! Your HR team has been notified to verify your onboarding dossier.')
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback('Failed to submit to HR: ' + (err.message || 'Server error'))
    } finally {
      setSaving(false)
    }
  }

  // Employee requests revision from HR with note/reason
  async function handleEmployeeRequestRevision(e) {
    if (e) e.preventDefault()
    setSaving(true)
    setFeedback('')
    try {
      const empId = employee?.id || employee?._id || employee?.employeeId
      const reason = revisionRequestNote.trim() || 'Employee requested onboarding dossier revision'

      setLocalStatus('revision_requested')
      if (hrStore.requestOnboardingRevision) {
        await hrStore.requestOnboardingRevision(empId, reason)
      } else {
        await hrStore.updateOnboardingDocs(empId, {
          onboardingStatus: 'revision_requested',
          onboardingNotes: reason,
        })
      }

      hrStore.addNotification({
        id: `notif-rev-req-${Date.now()}`,
        type: 'onboarding_revision_requested',
        title: 'Onboarding Revision Requested by Employee',
        message: `Employee ${employee?.name || 'Employee'} (${employee?.employeeId || 'ID'}) requested revision for onboarding documents: "${reason}". Dossier has been unlocked.`,
        time: 'Just now',
        read: false,
      })

      setEmployeeRevisionModal(false)
      setRevisionRequestNote('')
      setIsEditing(true)
      setFeedback('✓ Revision requested! Dossier unlocked — you can now update your details and re-upload documents.')
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 6000)
    } catch (err) {
      setFeedback('Failed to request revision: ' + (err.message || 'Server error'))
    } finally {
      setSaving(false)
    }
  }

  const handleRequestVerification = handleSubmitToHR

  // HR / Admin Verifies a Single Document
  async function handleVerifySingleDoc(docKey, docTitle) {
    if (!isHRorAdmin) {
      alert('Security Policy: Document verification is restricted to HR and Administrators reviewing employee files.')
      return
    }
    setSaving(true)
    try {
      const vAt = new Date().toISOString()
      const vBy = user?.displayName || user?.name || 'HR Management'
      const verifiedDocObj = {
        ...(docs[docKey] || {}),
        status: 'verified',
        verifiedAt: vAt,
        verifiedBy: vBy,
      }

      // Immediately record in local state so UI updates and subsequent verifies do not overwrite this
      setLocalDocOverrides((prev) => ({
        ...prev,
        [docKey]: verifiedDocObj,
        ...(docKey === 'aadharCard' ? { aadharDoc: verifiedDocObj } : {}),
        ...(docKey === 'panCard' ? { panDoc: verifiedDocObj } : {}),
      }))
      setLocalDocs((prev) => ({
        ...prev,
        [docKey]: verifiedDocObj,
        ...(docKey === 'aadharCard' ? { aadharDoc: verifiedDocObj } : {}),
        ...(docKey === 'panCard' ? { panDoc: verifiedDocObj } : {}),
      }))

      const empId = employee?.id || employee?._id || employee?.employeeId
      if (hrStore.approveDocument) {
        await hrStore.approveDocument(empId, docKey, { verifiedBy: vBy })
      } else if (hrStore.updateOnboardingDocs) {
        await hrStore.updateOnboardingDocs(empId, { onboardingDocs: { [docKey]: verifiedDocObj } })
      }

      hrStore.addNotification({
        id: `notif-doc-verified-${Date.now()}`,
        type: 'document_verified',
        title: `${docTitle || 'Document'} Verified by HR`,
        message: `${docTitle || 'Document'} for ${employee?.name || 'Employee'} has been verified and approved by ${vBy}.`,
        time: 'Just now',
        read: false,
      })

      if (viewingDoc) {
        setViewingDoc((prev) => prev ? { ...prev, status: 'verified', verifiedAt: vAt, verifiedBy: vBy } : null)
      }

      setFeedback(`✓ ${docTitle || 'Document'} successfully verified and marked approved!`)
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback('Failed to verify document: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // HR / Admin Rejects a Single Document with Reason
  async function handleRejectSingleDoc(docKey, docTitle, reason) {
    if (!isHRorAdmin) {
      alert('Security Policy: Document rejection is restricted to HR and Administrators.')
      return
    }
    if (!reason || !reason.trim()) {
      alert('Please provide a specific rejection reason so the employee knows what to fix.')
      return
    }
    setSaving(true)
    try {
      const empId = employee?.id || employee?._id || employee?.employeeId
      const rBy = user?.displayName || user?.name || 'HR Management'
      if (hrStore.rejectDocument) {
        await hrStore.rejectDocument(empId, docKey, reason.trim(), { rejectedBy: rBy })
      } else {
        const updatedDocs = { ...rawDocs, ...docs }
        const currentDoc = updatedDocs[docKey] || {}
        updatedDocs[docKey] = {
          ...currentDoc,
          status: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: rBy,
          rejectionReason: reason.trim(),
        }
        if (docKey === 'aadharCard') updatedDocs.aadharDoc = { ...updatedDocs[docKey] }
        if (docKey === 'panCard') updatedDocs.panDoc = { ...updatedDocs[docKey] }
        await hrStore.updateOnboardingDocs(empId, {
          onboardingDocs: updatedDocs,
          onboardingStatus: 'action_required',
          onboardingRejectionReason: reason.trim(),
        })
      }

      hrStore.addNotification({
        id: `notif-doc-rejected-${Date.now()}`,
        type: 'document_rejected',
        title: `${docTitle || 'Document'} Rejected by HR`,
        message: `${docTitle || 'Document'} for ${employee?.name || 'Employee'} requires revision: ${reason.trim()}`,
        time: 'Just now',
        read: false,
      })

      if (viewingDoc) {
        setViewingDoc((prev) => prev ? { ...prev, status: 'rejected', rejectionReason: reason.trim() } : null)
      }
      setRejectModal(null)
      setRejectionReason('')
      setFeedback(`Document rejected. Employee notified with reason: "${reason.trim()}".`)
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback('Failed to reject document: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function openRejectDocModal(key, title) {
    setRejectModal({ type: 'doc', docKey: key, title })
    setRejectionReason('')
  }

  // HR / Admin Approves & Marks Verified
  async function handleApproveByHR() {
    if (!isHRorAdmin) {
      alert('Security Policy: Approving onboarding dossiers is restricted to HR and Administrators reviewing other employee files.')
      return
    }
    setSaving(true)
    try {
      const verifiedDocs = { ...rawDocs, ...docs }
      const vAt = new Date().toISOString()
      const verifierName = user?.displayName || user?.name || 'HR Management'
      const empId = employee?.id || employee?._id || employee?.employeeId

      Object.keys(verifiedDocs).forEach((k) => {
        if (verifiedDocs[k]) {
          verifiedDocs[k] = {
            ...verifiedDocs[k],
            status: 'verified',
            verifiedAt: vAt,
            verifiedBy: verifierName,
          }
        }
      })

      const payload = {
        onboardingDocs: verifiedDocs,
        onboardingStatus: 'verified',
        onboardingVerifiedAt: vAt,
        onboardingVerifiedBy: verifierName,
      }

      if (hrStore.updateOnboardingDocs) {
        await hrStore.updateOnboardingDocs(empId, payload)
      } else {
        await hrStore.updateEmployee(empId, payload)
      }

      // Notify the employee of the verification approval
      hrStore.addNotification({
        id: `notif-verified-${Date.now()}`,
        type: 'onboarding_verified',
        title: 'Onboarding Documents Verified & Approved',
        message: `Your official onboarding documents and statutory details have been approved by HR (${verifierName}).`,
        time: 'Just now',
        read: false,
      })

      setFeedback(`✓ Onboarding documents approved! Marked as verified by ${verifierName} and locked for employee edits.`)
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback('Verification failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyByHR = handleApproveByHR

  // HR / Admin Rejects Dossier and Requests Revision with Reason
  async function handleRejectByHR(reason) {
    if (!isHRorAdmin) {
      alert('Security Policy: Requesting revisions is restricted to HR and Administrators.')
      return
    }
    if (!reason || !reason.trim()) {
      alert('Please provide a specific reason for requesting revisions.')
      return
    }
    setSaving(true)
    try {
      const empId = employee?.id || employee?._id || employee?.employeeId
      const rBy = user?.displayName || user?.name || 'HR Management'
      if (hrStore.rejectOnboarding) {
        await hrStore.rejectOnboarding(empId, reason.trim())
      } else {
        await hrStore.updateOnboardingDocs(empId, {
          onboardingStatus: 'action_required',
          onboardingRejectionReason: reason.trim(),
        })
      }
      setLocalStatus('action_required')
      hrStore.addNotification({
        id: `notif-onboard-reject-${Date.now()}`,
        type: 'onboarding_rejected',
        title: 'Onboarding Revisions Required',
        message: `Your onboarding submission was reviewed by HR (${rBy}) and requires revisions: ${reason.trim()}`,
        time: 'Just now',
        read: false,
      })
      setRejectModal(null)
      setRejectionReason('')
      setFeedback(`Onboarding returned to employee for revision: "${reason.trim()}".`)
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback('Failed to return onboarding: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // HR / Admin Unlocks for Revisions
  async function handleUnlockByHR() {
    if (!isHRorAdmin) {
      alert('Security Policy: Unlocking verified onboarding records is restricted to HR and Administrators.')
      return
    }
    if (!confirm('Unlock onboarding details for this employee to allow re-uploading?')) return
    setSaving(true)
    try {
      const empId = employee?.id || employee?._id || employee?.employeeId
      const payload = {
        onboardingStatus: 'revision_requested',
        onboardingUnlockedAt: new Date().toISOString(),
      }
      if (hrStore.updateOnboardingDocs) {
        await hrStore.updateOnboardingDocs(empId, payload)
      } else {
        await hrStore.updateEmployee(empId, payload)
      }
      setFeedback('Onboarding unlocked. The employee can now edit their details and documents.')
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback('Failed to unlock: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Save Financial Details (Restricted to HR and Administrators)
  async function handleSaveFinance(e) {
    e.preventDefault()
    if (!isHRorAdmin) {
      alert('Security Policy: Statutory financial & tax declarations can only be configured by HR and Administrators.')
      return
    }
    setSavingFinance(true)
    try {
      const empId = employee?.id || employee?._id || employee?.employeeId
      const payload = {
        financeDetails: { ...financeData },
      }
      if (hrStore.updateOnboardingDocs) {
        await hrStore.updateOnboardingDocs(empId, payload)
      } else {
        await hrStore.updateEmployee(empId, payload)
      }
      setFeedback('Financial & tax declarations updated successfully.')
      if (onUpdated) onUpdated()
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback('Failed to save financial preferences: ' + err.message)
    } finally {
      setSavingFinance(false)
    }
  }

  const docList = [
    { key: 'passportPhoto', label: 'Passport Photo', category: 'photo', isImage: true },
    { key: 'aadharCard', label: 'Aadhar Card', category: 'identity', number: identity.aadharNumber },
    { key: 'panCard', label: 'PAN Card', category: 'identity', number: identity.panNumber },
    { key: 'passport', label: 'Passport', category: 'identity', number: identity.passportNumber },
    { key: 'uanCard', label: 'UAN Card / Document', category: 'identity', number: identity.uanNumber, note: identity.hasExistingUan ? 'Existing UAN' : 'Fresh' },
    { key: 'signedOfferLetter', label: 'Signed Offer Letter', category: 'identity' },
    { key: 'cancelledCheque', label: 'Cancelled Cheque', category: 'bank' },
    { key: 'ugMarksheets', label: 'UG Marksheets', category: 'education' },
    { key: 'pgMarksheets', label: 'PG Marksheets', category: 'education' },
    { key: 'degreeCertificates', label: 'Degree Certificates', category: 'education' },
    { key: 'otherAcademicDocs', label: 'Other Academic Documents', category: 'education', multiple: true },
    { key: 'experienceLetter', label: 'Experience Letter', category: 'previous_employment' },
    { key: 'previousPayslip', label: 'Previous Payslip / Bank Statement', category: 'previous_employment' },
    { key: 'relievingLetter', label: 'Relieving Letter', category: 'previous_employment' },
    { key: 'offerLetter', label: 'Previous Offer Letter', category: 'previous_employment' },
    { key: 'verificationDatabaseForm', label: 'Candidate Database Form', category: 'verification' },
    { key: 'verificationBgvUndertaking', label: 'BGV Candidate Undertaking', category: 'verification' },
    { key: 'verificationIrfForm', label: 'Information Release Form (IRF)', category: 'verification' },
    { key: 'verificationAddressCourtForm', label: 'Address & Court Record Form', category: 'verification' },
    { key: 'verificationGuardianDeclaration', label: 'Parent / Guardian Declaration', category: 'verification' },
  ]

  const submittedCount = docList.filter((d) => docs[d.key]?.status === 'submitted' || docs[d.key]?.status === 'verified' || docs[d.key]?.url || docs[d.key]?.fileName).length
  const verificationCompletedCount = VERIFICATION_TEMPLATES.filter((tmpl) => Boolean(docs[tmpl.key]?.url || docs[tmpl.key]?.fileName)).length

  return (
    <div className="onboarding-dossier-root" style={{ display: 'grid', gap: '16px' }}>
      {/* Dossier Header Summary Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(0, 110, 111, 0.08) 0%, rgba(0, 45, 51, 0.04) 100%)',
        border: '1px solid #c7ded7',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {docs.passportPhoto?.url ? (
            <img
              src={docs.passportPhoto.url}
              alt="Passport"
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--teal)' }}
              onClick={() => setViewingDoc({ label: 'Passport Photo', url: docs.passportPhoto.url, isImage: true })}
            />
          ) : (
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eaf4f1', color: 'var(--teal)', display: 'grid', placeItems: 'center' }}>
              <Camera size={22} />
            </div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Onboarding & Statutory Dossier
              </h4>
              {isVerified ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #86efac'
                }}>
                  <CheckCircle2 size={13} /> Verified by HR
                </span>
              ) : isSubmitted ? (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a'
                }}>
                  <Clock size={13} /> Verification Pending
                </span>
              ) : (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  color: '#475569',
                }}>
                  <Clock size={13} /> Incomplete
                </span>
              )}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {submittedCount} of {docList.length} documents uploaded · {isVerified ? `Approved on ${new Date(employee.onboardingVerifiedAt || Date.now()).toLocaleDateString()}` : 'Awaiting HR verification'}
            </span>
          </div>
        </div>

        {/* Action Controls for Employee & HR */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* HR / Admin Approval Actions */}
          {isHRorAdmin && !isVerified && (
            <>
              <button
                type="button"
                className="ui-button secondary"
                style={{ fontSize: '12px', padding: '6px 14px', color: '#b91c1c', borderColor: '#fca5a5', background: '#fff' }}
                onClick={() => {
                  setRejectModal({ type: 'onboarding', title: 'Complete Onboarding Dossier' })
                  setRejectionReason('')
                }}
                disabled={saving}
              >
                <AlertCircle size={13} /> Request Revision / Reject
              </button>
              <button
                type="button"
                className="ui-button primary"
                style={{ fontSize: '12px', padding: '6px 14px', background: '#16a34a', borderColor: '#15803d' }}
                onClick={handleApproveByHR}
                disabled={saving}
              >
                <CheckCircle2 size={13} /> {saving ? 'Verifying...' : 'Approve & Mark Verified'}
              </button>
            </>
          )}

          {isHRorAdmin && isVerified && (
            <button
              type="button"
              className="ui-button secondary"
              style={{ fontSize: '11px', padding: '5px 10px' }}
              onClick={handleUnlockByHR}
              disabled={saving}
              title="Unlock to allow the employee to upload corrections"
            >
              <Unlock size={12} /> Unlock for Revision
            </button>
          )}

          {/* Employee Action Controls (in My Profile / Employee Panel) */}
          {!isHRorAdmin && (
            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ui-button primary"
                style={{
                  fontSize: '12px',
                  padding: '7px 16px',
                  background: 'var(--teal)',
                  borderColor: 'var(--teal)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  boxShadow: '0 2px 4px rgba(0, 110, 111, 0.2)'
                }}
                onClick={handleSubmitToHR}
                disabled={saving}
                title="Submit all your uploaded documents and details to HR for official verification"
              >
                <Send size={13} /> {saving ? 'Submitting...' : 'Submit to HR'}
              </button>

              <button
                type="button"
                className="ui-button secondary"
                style={{
                  fontSize: '12px',
                  padding: '7px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 600,
                  color: isVerified ? '#0d9488' : 'var(--text-primary)',
                  borderColor: isVerified ? '#0d9488' : 'var(--border-color)',
                  background: '#fff',
                }}
                onClick={() => {
                  setEmployeeRevisionModal(true)
                  setRevisionRequestNote('')
                }}
                disabled={saving}
                title="Request HR authorization to update or revise documents and personal details"
              >
                <RotateCcw size={13} /> Request for Revision
              </button>

              <button
                type="button"
                className="ui-button secondary"
                style={{ fontSize: '12px', padding: '7px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={13} /> Update Details & Docs
              </button>
            </div>
          )}
        </div>
      </div>

      {isVerified && !isHRorAdmin && (
        <div style={{ padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span><strong>Dossier Verified:</strong> Your onboarding documents and statutory details are verified by HR. If you need to make changes, click <strong>Request for Revision</strong> or re-upload your files directly.</span>
          </div>
          <button
            type="button"
            className="ui-button secondary"
            style={{ fontSize: '11px', padding: '4px 10px', borderColor: '#86efac', background: '#fff', color: '#166534', fontWeight: 600 }}
            onClick={() => setEmployeeRevisionModal(true)}
          >
            <RotateCcw size={12} /> Request Revision
          </button>
        </div>
      )}

      {isRevisionRequested && !isHRorAdmin && (
        <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '12px', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} style={{ color: '#d97706', flexShrink: 0 }} />
            <span><strong>Revision Active:</strong> Dossier unlocked for updates. You can upload updated media or edit details and click <strong>Submit to HR</strong> when done.</span>
          </div>
          <button
            type="button"
            className="ui-button primary"
            style={{ fontSize: '11px', padding: '4px 12px', background: '#d97706', borderColor: '#d97706', color: '#fff', fontWeight: 600 }}
            onClick={handleSubmitToHR}
          >
            <Send size={12} /> Submit to HR
          </button>
        </div>
      )}

      {feedback && (
        <div style={{ padding: '10px 14px', background: '#eaf4f1', color: 'var(--teal)', border: '1px solid #c7ded7', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
          <CheckCircle2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
          {feedback}
        </div>
      )}

      {/* Categorized Dossier Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '4px', overflowX: 'auto' }}>
        {[
          { id: 'verification', label: 'Verification Forms', icon: FileCheck2 },
          { id: 'identity', label: 'Identity & Statutory', icon: ShieldCheck },
          { id: 'bank', label: 'Bank & Remittance', icon: CreditCard },
          { id: 'finance', label: 'Finance & Tax Preferences', icon: TrendingUp },
          { id: 'education', label: 'Academic Marksheets', icon: FileText },
          { id: 'previous_employment', label: 'Previous Employment', icon: Briefcase },
          { id: 'family', label: 'Family & Emergency', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '10px 16px',
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--teal)' : 'var(--text-secondary)',
                borderBottom: isActive ? '2px solid var(--teal)' : '2px solid transparent',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab 0: Verification Forms (Download Blank, Sign, Re-upload & HR Verification Locker) */}
      {activeTab === 'verification' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {/* Header Locker Status Card */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: isVerified
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              border: isVerified ? '1px solid #86efac' : '1px solid #cbd5e1',
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
                    background: isVerified ? '#15803d' : '#0284c7',
                    color: '#ffffff',
                    letterSpacing: '0.3px',
                  }}
                >
                  {isVerified ? <Lock size={12} /> : <FileCheck2 size={12} />}
                  {isVerified ? 'VERIFIED & LOCKED IN LOCKER' : 'OFFICIAL BGV VERIFICATION SUITE'}
                </span>
                <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                  {verificationCompletedCount} of {VERIFICATION_TEMPLATES.length} Verification Documents Uploaded
                </span>
              </div>
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Mandatory Employee Verification Forms & Background Screening Locker
              </h4>
              <p style={{ margin: 0, fontSize: '12px', color: '#475569', maxWidth: '780px', lineHeight: '1.5' }}>
                {isHRorAdmin
                  ? "Official employee compliance and background screening locker. Review, verify, or request revisions for the employee's submitted signed documents."
                  : "Download each official blank template below, fill in your details and physically or digitally sign, then upload the completed signed copy. Once all forms are attached, click Submit Verification to HR. When verified by HR, your documents are permanently secured and locked in your official employee compliance locker."
                }
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {isSelfServiceUser && !isVerified && (
                <button
                  type="button"
                  className="ui-button primary"
                  style={{
                    fontSize: '12px',
                    padding: '8px 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--teal)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                  onClick={handleSubmitToHR}
                  disabled={saving || verificationCompletedCount === 0}
                  title="Submit all uploaded verification forms to HR"
                >
                  <Send size={13} /> Submit Verification to HR
                </button>
              )}
              {isSelfServiceUser && isVerified && (
                <button
                  type="button"
                  className="ui-button secondary"
                  style={{
                    fontSize: '12px',
                    padding: '7px 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#fff',
                    borderColor: '#86efac',
                    color: '#15803d',
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setEmployeeRevisionModal(true)
                    setRevisionRequestNote('')
                  }}
                  title="Request revision if you need to update any verification form"
                >
                  <RotateCcw size={13} /> Request Revision from HR
                </button>
              )}
              {isHRorAdmin && !isVerified && (
                <button
                  type="button"
                  className="ui-button primary"
                  style={{
                    fontSize: '12px',
                    padding: '8px 16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#059669',
                    borderColor: '#059669',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                  onClick={handleVerifyByHR}
                  disabled={saving}
                  title="Verify and lock all documents into employee dossier locker"
                >
                  <CheckCircle2 size={13} /> Verify & Lock in Locker
                </button>
              )}
            </div>
          </div>

          {/* Cards for each of the 5 verification forms */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: '18px' }}>
            {VERIFICATION_TEMPLATES.map((tmpl) => (
              <VerificationFormCard
                key={tmpl.key}
                template={tmpl}
                docData={docs[tmpl.key]}
                isVerified={isVerified}
                canEdit={canUpload}
                isHRorAdmin={isHRorAdmin}
                onView={(data) => setViewingDoc({ ...data, label: tmpl.title, title: tmpl.title })}
                onQuickUpload={canUpload ? handleQuickUpload : null}
                onVerifySingle={handleVerifySingleDoc}
                onRejectSingle={openRejectDocModal}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 1: Identity & Statutory */}
      {activeTab === 'identity' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <DocumentCard
            title="Aadhar Card"
            docKey="aadharCard"
            docData={docs.aadharCard}
            numberLabel="Aadhar Number"
            numberValue={identity.aadharNumber}
            badge={docs.aadharCard?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'Aadhar Card', title: 'Aadhar Card', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="PAN Card"
            docKey="panCard"
            docData={docs.panCard}
            numberLabel="PAN Number"
            numberValue={identity.panNumber}
            badge={docs.panCard?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'PAN Card', title: 'PAN Card', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Passport"
            docKey="passport"
            docData={docs.passport}
            numberLabel="Passport Number"
            numberValue={identity.passportNumber}
            badge={docs.passport?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'Passport', title: 'Passport', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="UAN Document"
            docKey="uanCard"
            docData={docs.uanCard}
            numberLabel="PF UAN Number"
            numberValue={identity.uanNumber}
            badge={docs.uanCard?.status === 'verified' || isVerified ? 'VERIFIED' : (identity.hasExistingUan ? 'Existing UAN' : 'Fresh')}
            onView={(data) => setViewingDoc({ label: 'UAN Document', title: 'UAN Document', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Signed Offer Letter"
            docKey="signedOfferLetter"
            docData={docs.signedOfferLetter}
            badge={docs.signedOfferLetter?.status === 'verified' || isVerified ? 'VERIFIED' : 'MANDATORY'}
            onView={(data) => setViewingDoc({ label: 'Signed Offer Letter', title: 'Signed Offer Letter', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
        </div>
      )}

      {/* Tab 2: Bank & Remittance (Directly connected to payslip) */}
      {activeTab === 'bank' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          <div className="panel" style={{ padding: '18px', background: '#fcfdfd', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={16} style={{ color: 'var(--teal)' }} /> Official Salary Bank Account
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--teal)', background: 'rgba(0, 110, 111, 0.08)', padding: '3px 8px', borderRadius: '10px', fontWeight: 600 }}>
                ⚡ Connected with Payslip Generator
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Bank Name</span>
                <strong style={{ fontSize: '13px' }}>{bank.bankName || 'Not configured'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Bank Account Number</span>
                <strong style={{ fontSize: '14px', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  {unmaskBankAccount(bank.accountNumber, 'Not configured')}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Bank IFSC Code</span>
                <strong style={{ fontSize: '13px', fontFamily: 'monospace' }}>{bank.ifscCode || 'Not configured'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '2px' }}>Account Holder Name</span>
                <strong>{bank.accountHolderName || employee?.name || 'Self'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            <DocumentCard
              title="Cancelled Cheque / Bank Passbook"
              docKey="cancelledCheque"
              docData={docs.cancelledCheque}
              numberLabel="Account Number"
              numberValue={bank.accountNumber}
              badge={docs.cancelledCheque?.status === 'verified' || isVerified ? 'VERIFIED' : 'MANDATORY'}
              onView={(data) => setViewingDoc({ label: 'Cancelled Cheque', title: 'Cancelled Cheque / Bank Passbook', ...data })}
              onVerifySingle={handleVerifySingleDoc}
              onRejectSingle={openRejectDocModal}
              onQuickUpload={canUpload ? handleQuickUpload : null}
              canEdit={canUpload}
              isHRorAdmin={isHRorAdmin}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Finance & Tax Declarations (Editable ONLY by HR & Admin) */}
      {activeTab === 'finance' && (
        isHRorAdmin ? (
          <form onSubmit={handleSaveFinance} style={{ display: 'grid', gap: '16px' }}>
            <div className="panel" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={16} style={{ color: 'var(--teal)' }} /> Income Tax Regime & Statutory Declarations
                  </h4>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    HR & Admin Configuration: Configure statutory tax regime and declarations for payroll processing.
                  </p>
                </div>
                <button
                  type="submit"
                  className="ui-button primary"
                  disabled={savingFinance}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {savingFinance ? 'Saving...' : 'Save Financial Preferences'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="payroll-form-field">
                  <label style={{ fontWeight: 600, fontSize: '12px' }}>Preferred Tax Regime *</label>
                  <select
                    value={financeData.taxRegime}
                    onChange={(e) => setFinanceData({ ...financeData, taxRegime: e.target.value })}
                    className="ui-input"
                  >
                    <option value="new_regime">New Tax Regime (Section 115BAC - Default Lower Slabs)</option>
                    <option value="old_regime">Old Tax Regime (Allows Chapter VI-A Deductions & HRA)</option>
                  </select>
                  <small style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Standard deduction of ₹75,000 auto-applied</small>
                </div>

                <div className="payroll-form-field">
                  <label style={{ fontWeight: 600, fontSize: '12px' }}>Voluntary PF (VPF) Monthly Contribution (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={financeData.vpfMonthly}
                    onChange={(e) => setFinanceData({ ...financeData, vpfMonthly: Number(e.target.value) || 0 })}
                    className="ui-input"
                    placeholder="0 (Optional above statutory 12%)"
                  />
                </div>

                <div className="payroll-form-field">
                  <label style={{ fontWeight: 600, fontSize: '12px' }}>Section 80C Investment Declaration (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max="150000"
                    value={financeData.sec80cDeclared}
                    onChange={(e) => setFinanceData({ ...financeData, sec80cDeclared: Number(e.target.value) || 0 })}
                    className="ui-input"
                    placeholder="Max ₹1,50,000 (PPF, ELSS, Insurance)"
                  />
                </div>

                <div className="payroll-form-field">
                  <label style={{ fontWeight: 600, fontSize: '12px' }}>Section 80D Health Mediclaim (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={financeData.sec80dDeclared}
                    onChange={(e) => setFinanceData({ ...financeData, sec80dDeclared: Number(e.target.value) || 0 })}
                    className="ui-input"
                    placeholder="Medical insurance premium"
                  />
                </div>

                <div className="payroll-form-field">
                  <label style={{ fontWeight: 600, fontSize: '12px' }}>Monthly Rent Paid for HRA Exemption (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={financeData.hraMonthlyRent}
                    onChange={(e) => setFinanceData({ ...financeData, hraMonthlyRent: Number(e.target.value) || 0 })}
                    className="ui-input"
                    placeholder="Monthly rent amount"
                  />
                </div>

                <div className="payroll-form-field">
                  <label style={{ fontWeight: 600, fontSize: '12px' }}>Landlord PAN (Required if rent &gt; ₹1L/year)</label>
                  <input
                    type="text"
                    value={financeData.landlordPan}
                    onChange={(e) => setFinanceData({ ...financeData, landlordPan: e.target.value.toUpperCase() })}
                    className="ui-input"
                    placeholder="e.g. ABCDE1234F"
                  />
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="panel" style={{ padding: '20px', display: 'grid', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <TrendingUp size={16} style={{ color: 'var(--teal)' }} /> Income Tax Regime & Statutory Declarations
                  </h4>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    color: '#475569',
                    border: '1px solid #cbd5e1'
                  }}>
                    <Lock size={12} /> Managed by HR & Admin Only
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Statutory tax declarations and payroll preferences are configured and managed exclusively by HR & Payroll Administration. To request modifications, please contact HR.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>PREFERRED TAX REGIME</span>
                <strong style={{ fontSize: '14px', color: 'var(--teal)' }}>
                  {financeData.taxRegime === 'old_regime' ? 'Old Tax Regime' : 'New Tax Regime (Section 115BAC)'}
                </strong>
                <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  {financeData.taxRegime === 'old_regime' ? 'Allows Chapter VI-A deductions & HRA exemption' : 'Default lower slab rates with standard deduction'}
                </small>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>VOLUNTARY PF (VPF) MONTHLY</span>
                <strong style={{ fontSize: '15px' }}>
                  {financeData.vpfMonthly ? `₹${Number(financeData.vpfMonthly).toLocaleString('en-IN')}` : '₹0'}
                </strong>
                <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  {financeData.vpfMonthly ? 'Additional monthly employee contribution' : 'Standard 12% statutory PF only'}
                </small>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>SECTION 80C INVESTMENT DECLARATION</span>
                <strong style={{ fontSize: '15px' }}>
                  {financeData.sec80cDeclared ? `₹${Number(financeData.sec80cDeclared).toLocaleString('en-IN')}` : '₹0'}
                </strong>
                <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  PPF, ELSS, Life Insurance, EPF (Max ₹1.5L)
                </small>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>SECTION 80D HEALTH MEDICLAIM</span>
                <strong style={{ fontSize: '15px' }}>
                  {financeData.sec80dDeclared ? `₹${Number(financeData.sec80dDeclared).toLocaleString('en-IN')}` : '₹0'}
                </strong>
                <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  Medical & health insurance premium
                </small>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>MONTHLY RENT PAID FOR HRA</span>
                <strong style={{ fontSize: '15px' }}>
                  {financeData.hraMonthlyRent ? `₹${Number(financeData.hraMonthlyRent).toLocaleString('en-IN')}` : '₹0'}
                </strong>
                <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  Declared monthly rental expense
                </small>
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>LANDLORD PAN</span>
                <strong style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                  {financeData.landlordPan || 'Not recorded'}
                </strong>
                <small style={{ display: 'block', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
                  Required for annual rent exceeding ₹1,00,000
                </small>
              </div>
            </div>
          </div>
        )
      )}

      {/* Tab 4: Academic Marksheets */}
      {activeTab === 'education' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <DocumentCard
            title="Undergraduate Marksheets"
            docKey="ugMarksheets"
            docData={docs.ugMarksheets}
            badge={docs.ugMarksheets?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'UG Marksheets', title: 'Undergraduate Marksheets', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Postgraduate Marksheets"
            docKey="pgMarksheets"
            docData={docs.pgMarksheets}
            badge={docs.pgMarksheets?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'PG Marksheets', title: 'Postgraduate Marksheets', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Degree Certificate"
            docKey="degreeCertificates"
            docData={docs.degreeCertificates}
            badge={docs.degreeCertificates?.status === 'verified' || isVerified ? 'VERIFIED' : 'MANDATORY'}
            onView={(data) => setViewingDoc({ label: 'Degree Certificate', title: 'Degree Certificate', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Other Academic Documents"
            docKey="otherAcademicDocs"
            docData={docs.otherAcademicDocs}
            badge={docs.otherAcademicDocs?.status === 'verified' || isVerified ? 'VERIFIED' : (docs.otherAcademicDocs?.files?.length ? `${docs.otherAcademicDocs.files.length} Files Attached` : undefined)}
            onView={(data) => setViewingDoc({ label: 'Other Academic Documents', title: 'Other Academic Documents', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
            allowMultiple={true}
          />
        </div>
      )}

      {/* Tab 5: Previous Employment Documents */}
      {activeTab === 'previous_employment' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <DocumentCard
            title="Experience Letter"
            docKey="experienceLetter"
            docData={docs.experienceLetter}
            badge={docs.experienceLetter?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'Experience Letter', title: 'Experience Letter', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Previous Payslip / Bank Statement"
            docKey="previousPayslip"
            docData={docs.previousPayslip}
            badge={docs.previousPayslip?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'Previous Payslip / Bank Statement', title: 'Previous Payslip / Bank Statement', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Relieving Letter"
            docKey="relievingLetter"
            docData={docs.relievingLetter}
            badge={docs.relievingLetter?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'Relieving Letter', title: 'Relieving Letter', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
          <DocumentCard
            title="Previous Offer Letter"
            docKey="offerLetter"
            docData={docs.offerLetter}
            badge={docs.offerLetter?.status === 'verified' || isVerified ? 'VERIFIED' : undefined}
            onView={(data) => setViewingDoc({ label: 'Previous Offer Letter', title: 'Previous Offer Letter', ...data })}
            onVerifySingle={handleVerifySingleDoc}
            onRejectSingle={openRejectDocModal}
            onQuickUpload={canUpload ? handleQuickUpload : null}
            canEdit={canUpload}
            isHRorAdmin={isHRorAdmin}
          />
        </div>
      )}

      {/* Tab 5: Family & Emergency */}
      {activeTab === 'family' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div className="panel" style={{ padding: '16px' }}>
            <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Parents Information</h5>
            <div style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Father's Name:</span> <strong>{parents.fatherName || 'Not recorded'}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Mother's Name:</span> <strong>{parents.motherName || 'Not recorded'}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Parent Contact Phone:</span> <strong>{parents.parentPhone || parents.phone || 'Not recorded'}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Permanent Residence:</span> <strong>{parents.address || 'Not recorded'}</strong></div>
            </div>
          </div>

          <div className="panel" style={{ padding: '16px' }}>
            <h5 style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Emergency Contact</h5>
            <div style={{ display: 'grid', gap: '6px', fontSize: '12px' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Primary Contact Name:</span> <strong>{emergency.name || 'Not recorded'}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Relationship:</span> <strong>{emergency.relationship || 'Not recorded'}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Emergency Contact Phone:</span> <strong>{emergency.phone || 'Not recorded'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Document Full View Modal */}
      {viewingDoc && typeof document !== "undefined" && document?.body && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px'
          }}
          onClick={() => setViewingDoc(null)}
        >
          {/* Prominent floating red close button */}
          <button
            type="button"
            onClick={() => setViewingDoc(null)}
            style={{
              position: 'fixed',
              top: '16px',
              right: '20px',
              zIndex: 100002,
              background: '#e11d48',
              color: '#ffffff',
              border: '2px solid rgba(255,255,255,0.8)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
              cursor: 'pointer'
            }}
            title="Close Preview (Esc)"
          >
            <X size={22} strokeWidth={2.5} />
          </button>

          <div
            className="panel"
            style={{
              width: '92%',
              maxWidth: '740px',
              maxHeight: '88vh',
              overflow: 'auto',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="#0d9488" />
                    {viewingDoc.title || viewingDoc.label || viewingDoc.fileName || 'Document Verification Preview'}
                  </h3>
                  {viewingDoc.status === 'verified' || viewingDoc.badge === 'VERIFIED' ? (
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={13} /> VERIFIED
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '12px', background: '#fef3c7', color: '#b45309', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> PENDING HR APPROVAL
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Employee: <strong style={{ color: '#0f172a' }}>{employee?.name || employee?.displayName || 'Employee'}</strong> • Code: <strong>{employee?.employeeId || employee?.id || 'ETS'}</strong> • Dept: <strong>{employee?.department || 'General'}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setViewingDoc(null)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#dc2626',
                  borderRadius: '6px',
                  padding: '6px 14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                title="Close Document Preview (Esc)"
              >
                <X size={15} /> Close
              </button>
            </div>

            {/* Multi-file interactive switcher if multiple files attached */}
            {viewingDoc.files && viewingDoc.files.length > 1 && (
              <div style={{
                background: '#f8fafc',
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #cbd5e1'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} color="#0d9488" /> Attached Files ({viewingDoc.files.length}):
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    Click to switch preview
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {viewingDoc.files.map((file, idx) => {
                    const isSelected = viewingDoc.selectedFileIndex !== undefined
                      ? viewingDoc.selectedFileIndex === idx
                      : (viewingDoc.url === file.url || idx === 0)
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const isImg = file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name || '')
                          setViewingDoc(prev => ({
                            ...prev,
                            url: file.url,
                            fileName: file.name,
                            isImage: isImg,
                            selectedFileIndex: idx
                          }))
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: isSelected ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                          background: isSelected ? '#ccfbf1' : '#ffffff',
                          color: isSelected ? '#0f766e' : '#475569',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          whiteSpace: 'nowrap',
                          boxShadow: isSelected ? '0 1px 3px rgba(13, 148, 136, 0.2)' : 'none'
                        }}
                      >
                        <FileText size={12} />
                        {file.name || `File ${idx + 1}`}
                        {file.size ? <span style={{ opacity: 0.7, fontSize: '10px' }}>({file.size})</span> : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Document Content */}
            {viewingDoc.isImage || viewingDoc.url?.startsWith('data:image') || (viewingDoc.url && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(viewingDoc.url)) ? (
              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <img src={viewingDoc.url} alt="Document" style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '6px' }} />
              </div>
            ) : viewingDoc.url?.startsWith('data:video') || (viewingDoc.url && /\.(mp4|webm|ogg|mov)$/i.test(viewingDoc.url)) ? (
              <div style={{ textAlign: 'center', background: '#090d16', padding: '16px', borderRadius: '10px', marginBottom: '18px' }}>
                <video src={viewingDoc.url} controls style={{ maxWidth: '100%', maxHeight: '55vh', borderRadius: '6px' }} />
              </div>
            ) : viewingDoc.url?.startsWith('data:audio') || (viewingDoc.url && /\.(mp3|wav|ogg|aac|m4a)$/i.test(viewingDoc.url)) ? (
              <div style={{ textAlign: 'center', background: '#f8fafc', padding: '24px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '18px' }}>
                <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>Audio Recording / Voice Document</p>
                <audio src={viewingDoc.url} controls style={{ width: '100%', maxWidth: '420px' }} />
              </div>
            ) : viewingDoc.url?.startsWith('data:application/pdf') || (viewingDoc.url && viewingDoc.url.startsWith('http') && /\.pdf$/i.test(viewingDoc.url)) ? (
              <div style={{ marginBottom: '18px' }}>
                <iframe src={viewingDoc.url} title="Document" style={{ width: '100%', height: '55vh', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
              </div>
            ) : (
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                padding: '24px',
                marginBottom: '18px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-25deg)',
                  fontSize: '48px',
                  fontWeight: 900,
                  color: viewingDoc.status === 'verified' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(15, 23, 42, 0.04)',
                  letterSpacing: '6px',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap'
                }}>
                  {viewingDoc.status === 'verified' ? 'HR VERIFIED' : 'SUBMITTED FOR HR REVIEW'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', position: 'relative', zIndex: 1 }}>
                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Document Title</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewingDoc.title || viewingDoc.label || 'Statutory Record'}</strong>
                  </div>

                  {viewingDoc.numberValue && (
                    <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>{viewingDoc.numberLabel || 'Registered Identifier'}</span>
                      <strong style={{ fontSize: '13px', color: '#0d9488', fontFamily: 'monospace' }}>{viewingDoc.numberValue}</strong>
                    </div>
                  )}

                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Uploaded File</span>
                    <strong style={{ fontSize: '13px', color: '#2563eb', wordBreak: 'break-all' }}>{viewingDoc.fileName || 'Attached_Document.pdf'}</strong>
                  </div>

                  <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Submission Date</span>
                    <strong style={{ fontSize: '13px', color: '#0f172a' }}>{viewingDoc.submittedAt ? new Date(viewingDoc.submittedAt).toLocaleString() : 'October 8, 2026'}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '12px', background: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={28} color={viewingDoc.status === 'verified' ? '#16a34a' : '#0d9488'} />
                  <div>
                    <h5 style={{ margin: 0, fontSize: '13px', color: '#0f172a' }}>HR Compliance & Audit Verification</h5>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                      {viewingDoc.status === 'verified'
                        ? `This document was officially verified and locked by HR (${viewingDoc.verifiedBy || 'HR Lead'}) on ${viewingDoc.verifiedAt ? new Date(viewingDoc.verifiedAt).toLocaleDateString() : 'Today'}.`
                        : 'Review employee statutory credentials and click the approval button below to mark verified.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Status: <strong style={{ color: viewingDoc.status === 'verified' ? '#16a34a' : '#d97706' }}>{viewingDoc.status === 'verified' ? 'Verified & Locked' : 'Pending HR Verification'}</strong>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                {viewingDoc.files && viewingDoc.files.length > 1 ? (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {viewingDoc.files.map((f, i) => (
                      <a
                        key={i}
                        href={f.url}
                        download={f.name || `file-${i + 1}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ui-button secondary"
                        style={{
                          textDecoration: 'none',
                          fontSize: '11px',
                          padding: '6px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                        title={`Download ${f.name || `File ${i + 1}`}`}
                      >
                        <Download size={13} /> {f.name ? (f.name.length > 20 ? f.name.slice(0, 18) + '...' : f.name) : `File ${i + 1}`}
                      </a>
                    ))}
                  </div>
                ) : viewingDoc.url && (
                  <a
                    href={viewingDoc.url}
                    download={viewingDoc.fileName || `${viewingDoc.title || viewingDoc.label || 'document'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-button secondary"
                    style={{
                      textDecoration: 'none',
                      fontSize: '12px',
                      padding: '8px 14px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={14} /> Download / Open Media
                  </a>
                )}
                {isHRorAdmin && viewingDoc.status !== 'verified' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectModal({
                          type: 'doc',
                          docKey: viewingDoc.docKey,
                          title: viewingDoc.title || viewingDoc.label,
                        })
                        setRejectionReason('')
                      }}
                      disabled={saving}
                      className="ui-button secondary"
                      style={{
                        background: '#ffffff',
                        borderColor: '#ef4444',
                        color: '#b91c1c',
                        fontWeight: 600,
                        padding: '8px 16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <AlertCircle size={15} />
                      Reject Document
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifySingleDoc(viewingDoc.docKey, viewingDoc.title || viewingDoc.label)}
                      disabled={saving}
                      className="ui-button primary"
                      style={{
                        background: '#059669',
                        borderColor: '#059669',
                        color: '#ffffff',
                        fontWeight: 600,
                        padding: '8px 18px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <CheckCircle2 size={16} />
                      {saving ? 'Verifying...' : 'Approve & Verify This Document'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Onboarding Details Modal */}
      {isEditing && typeof document !== 'undefined' && document?.body && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100000,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '16px',
            boxSizing: 'border-box'
          }}
          onClick={() => setIsEditing(false)}
        >
          <div
            className="panel"
            style={{
              width: '100%',
              maxWidth: '840px',
              height: '90vh',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '18px 24px',
                borderBottom: '1px solid var(--border-color)',
                background: '#ffffff',
                flexShrink: 0,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--ink)' }}>Update Onboarding & Statutory Details</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Once submitted, HR will review and verify your documents. After HR approval, onboarding data will be locked.
                </p>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setIsEditing(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', padding: '6px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="onboarding-edit-form"
              onSubmit={handleSave}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                background: '#f8fafc',
              }}
            >
              {/* 1. Identity Credentials Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px 22px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 110, 111, 0.08)', color: 'var(--teal, #006e6f)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                        1. Government & Statutory Identity
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Mandatory government identifiers required for statutory compliance and payroll.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--teal)', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '999px' }}>
                    Identity
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Aadhar Card Number
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.identity.aadharNumber || ''}
                      onChange={(e) => setEditData({ ...editData, identity: { ...editData.identity, aadharNumber: e.target.value } })}
                      placeholder="12-digit UIDAI number"
                      maxLength={16}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    PAN Card Number
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.identity.panNumber || ''}
                      onChange={(e) => setEditData({ ...editData, identity: { ...editData.identity, panNumber: e.target.value.toUpperCase() } })}
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Passport Number
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.identity.passportNumber || ''}
                      onChange={(e) => setEditData({ ...editData, identity: { ...editData.identity, passportNumber: e.target.value.toUpperCase() } })}
                      placeholder="e.g. Z1234567 (Optional)"
                      maxLength={15}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Universal Account Number (PF UAN)
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.identity.uanNumber || ''}
                      onChange={(e) => setEditData({ ...editData, identity: { ...editData.identity, uanNumber: e.target.value } })}
                      placeholder="12-digit EPFO UAN"
                      maxLength={16}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Date of Birth (DOB)
                    <input
                      type="date"
                      className="ui-input"
                      value={editData.dob || editData.identity?.dob || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        dob: e.target.value,
                        identity: { ...editData.identity, dob: e.target.value }
                      })}
                    />
                  </label>
                </div>
              </div>

              {/* 2. Bank Details Card */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px 22px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 110, 111, 0.08)', color: 'var(--teal, #006e6f)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                        2. Bank Account Details (Salary Disbursement)
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Official bank account for monthly salary credit and expense reimbursements.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--teal)', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '999px' }}>
                    Salary Credit
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Bank Name
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.bankDetails.bankName || ''}
                      onChange={(e) => setEditData({ ...editData, bankDetails: { ...editData.bankDetails, bankName: e.target.value } })}
                      placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Bank Account Number
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.bankDetails.accountNumber || ''}
                      onChange={(e) => setEditData({ ...editData, bankDetails: { ...editData.bankDetails, accountNumber: e.target.value } })}
                      placeholder="Full account number"
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Bank IFSC Code
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.bankDetails.ifscCode || ''}
                      onChange={(e) => setEditData({ ...editData, bankDetails: { ...editData.bankDetails, ifscCode: e.target.value.toUpperCase() } })}
                      placeholder="e.g. HDFC0001234"
                      maxLength={11}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                    Account Holder Name
                    <input
                      type="text"
                      className="ui-input"
                      value={editData.bankDetails.accountHolderName || ''}
                      onChange={(e) => setEditData({ ...editData, bankDetails: { ...editData.bankDetails, accountHolderName: e.target.value } })}
                      placeholder={employee?.name || 'Full legal name on passbook'}
                    />
                  </label>
                </div>
              </div>

              {/* 3. Family & Emergency Contacts Card (MOVED BEFORE DOCUMENT UPLOADS) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px 22px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 110, 111, 0.08)', color: 'var(--teal, #006e6f)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Users size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                        3. Family & Emergency Contacts
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Parental information and designated emergency contact for immediate reachability.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--teal)', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '999px' }}>
                    Contacts
                  </span>
                </div>

                {/* Subsection A: Parents Information */}
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    • Parents / Guardian Information
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Father's Full Name
                      <input
                        type="text"
                        className="ui-input"
                        value={editData.parentsContact.fatherName || ''}
                        onChange={(e) => setEditData({ ...editData, parentsContact: { ...editData.parentsContact, fatherName: e.target.value } })}
                        placeholder="Father's full name"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Mother's Full Name
                      <input
                        type="text"
                        className="ui-input"
                        value={editData.parentsContact.motherName || ''}
                        onChange={(e) => setEditData({ ...editData, parentsContact: { ...editData.parentsContact, motherName: e.target.value } })}
                        placeholder="Mother's full name"
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Parents' Contact Phone
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className="ui-input"
                        value={editData.parentsContact.parentPhone || ''}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[^0-9+\s\-()]/g, '')
                          setEditData((prev) => ({
                            ...prev,
                            parentsContact: {
                              ...(prev.parentsContact || {}),
                              parentPhone: sanitized,
                            },
                          }))
                        }}
                        placeholder="e.g. +91 98765 43210 (Numerical values only)"
                        maxLength={20}
                      />
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        Numerical digits only (min. 10 digits)
                      </span>
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Permanent Residence Address
                      <input
                        type="text"
                        className="ui-input"
                        value={editData.parentsContact.address || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setEditData((prev) => ({
                            ...prev,
                            parentsContact: {
                              ...(prev.parentsContact || {}),
                              address: val,
                            },
                          }))
                        }}
                        placeholder="House / Street / City / State / Pincode"
                      />
                    </label>
                  </div>
                </div>

                {/* Subsection B: Emergency Contact (Clean, Separate Inputs) */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      • Designated Emergency Contact
                    </span>
                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                      (Immediate point of contact in case of emergency)
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Emergency Contact Name
                      <input
                        type="text"
                        autoComplete="name"
                        className="ui-input"
                        value={editData.emergencyContact.name || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setEditData((prev) => ({
                            ...prev,
                            emergencyContact: {
                              ...(prev.emergencyContact || {}),
                              name: val,
                            },
                          }))
                        }}
                        placeholder="e.g. Rajesh Kumar (Full Name)"
                        maxLength={60}
                      />
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Relationship to Employee
                      <input
                        type="text"
                        list="relationship-presets"
                        className="ui-input"
                        value={editData.emergencyContact.relationship || ''}
                        onChange={(e) => {
                          const val = e.target.value
                          setEditData((prev) => ({
                            ...prev,
                            emergencyContact: {
                              ...(prev.emergencyContact || {}),
                              relationship: val,
                            },
                          }))
                        }}
                        placeholder="e.g. Father, Mother, Spouse, Brother, Sister"
                        maxLength={40}
                      />
                      <datalist id="relationship-presets">
                        <option value="Father" />
                        <option value="Mother" />
                        <option value="Spouse" />
                        <option value="Brother" />
                        <option value="Sister" />
                        <option value="Son" />
                        <option value="Daughter" />
                        <option value="Guardian" />
                        <option value="Relative" />
                        <option value="Friend" />
                      </datalist>
                    </label>
                    <label style={{ display: 'grid', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Emergency Contact Phone Number
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        className="ui-input"
                        value={editData.emergencyContact.phone || ''}
                        onChange={(e) => {
                          const sanitized = e.target.value.replace(/[^0-9+\s\-()]/g, '')
                          setEditData((prev) => ({
                            ...prev,
                            emergencyContact: {
                              ...(prev.emergencyContact || {}),
                              phone: sanitized,
                            },
                          }))
                        }}
                        placeholder="e.g. +91 98765 43210 (Numerical values only)"
                        maxLength={20}
                      />
                      <span style={{ fontSize: '10px', color: '#64748b' }}>
                        Numerical digits only (min. 10 digits)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 4. Document & Media Uploads Card (PLACED AT THE END BEFORE SUBMISSION) */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px 22px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(0, 110, 111, 0.08)', color: 'var(--teal, #006e6f)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Upload size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>
                        4. Document & Media Uploads
                      </h4>
                      <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                        Upload clear scans or photos (PDF, JPG, PNG, WebP) for HR verification.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--teal)', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 8px', borderRadius: '999px' }}>
                    Attestation
                  </span>
                </div>

                {/* 4.1 Statutory & Identity Documents */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    • Statutory & Identity Documents
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                    {docList.filter((d) => ['photo', 'identity', 'bank'].includes(d.category)).map((doc) => (
                      <ModalDocInput
                        key={doc.key}
                        doc={doc}
                        currentDoc={editData.onboardingDocs?.[doc.key]}
                        onSelect={handleFileSelect}
                      />
                    ))}
                  </div>
                </div>

                {/* 4.2 Academic Marksheets */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    • Academic Marksheets & Degrees
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                    {docList.filter((d) => d.category === 'education').map((doc) => (
                      <ModalDocInput
                        key={doc.key}
                        doc={doc}
                        currentDoc={editData.onboardingDocs?.[doc.key]}
                        onSelect={handleFileSelect}
                      />
                    ))}
                  </div>
                </div>

                {/* 4.3 Previous Employment Documents */}
                <div>
                  <span style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    • Previous Employment Records
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '12px' }}>
                    {docList.filter((d) => d.category === 'previous_employment').map((doc) => (
                      <ModalDocInput
                        key={doc.key}
                        doc={doc}
                        currentDoc={editData.onboardingDocs?.[doc.key]}
                        onSelect={handleFileSelect}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </form>

            {/* Sticky Action Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 24px',
                borderTop: '1px solid var(--border-color)',
                background: '#f8fafc',
                flexShrink: 0,
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                * All statutory and bank details are encrypted and sent directly to HR for verification.
              </span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="ui-button secondary"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="onboarding-edit-form"
                  className="ui-button primary"
                  disabled={saving}
                  style={{ fontWeight: 600, padding: '9px 20px', background: 'var(--teal)', borderColor: 'var(--teal)', color: '#ffffff' }}
                >
                  {saving ? 'Saving & Submitting...' : 'Submit for HR Verification'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {/* Rejection with Reason Modal */}
      {rejectModal && typeof document !== "undefined" && document?.body && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100005,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
          onClick={() => setRejectModal(null)}
        >
          <div
            className="panel"
            style={{
              width: '92%',
              maxWidth: '520px',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'grid', placeItems: 'center' }}>
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Reject {rejectModal.title}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Provide a specific reason for revision to notify the employee.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setRejectModal(null)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (rejectModal.type === 'doc') {
                  handleRejectSingleDoc(rejectModal.docKey, rejectModal.title, rejectionReason)
                } else {
                  handleRejectByHR(rejectionReason)
                }
              }}
              style={{ display: 'grid', gap: '14px' }}
            >
              <label style={{ display: 'grid', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                Rejection Reason *
                <textarea
                  rows={4}
                  className="ui-input"
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Scanned document is blurry, please provide a clear high-resolution PDF or colored copy."
                  required
                  autoFocus
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="ui-button secondary"
                  onClick={() => setRejectModal(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button primary"
                  style={{ background: '#dc2626', borderColor: '#dc2626', color: '#fff', fontWeight: 600 }}
                  disabled={saving || !rejectionReason.trim()}
                >
                  {saving ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Employee Revision Request Modal */}
      {employeeRevisionModal && typeof document !== "undefined" && document?.body && createPortal(
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100005,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            padding: '20px',
          }}
          onClick={() => setEmployeeRevisionModal(false)}
        >
          <div
            className="panel"
            style={{
              width: '92%',
              maxWidth: '520px',
              padding: '24px',
              background: '#ffffff',
              borderRadius: '14px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(0, 110, 111, 0.1)', color: 'var(--teal)', display: 'grid', placeItems: 'center' }}>
                  <RotateCcw size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Request Onboarding Revision
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                    Send a revision request to HR to unlock and update your documents or details.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setEmployeeRevisionModal(false)}
                style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEmployeeRequestRevision} style={{ display: 'grid', gap: '14px' }}>
              <label style={{ display: 'grid', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
                What would you like to update or revise? *
                <textarea
                  rows={4}
                  className="ui-input"
                  style={{ width: '100%', resize: 'vertical', fontFamily: 'inherit' }}
                  value={revisionRequestNote}
                  onChange={(e) => setRevisionRequestNote(e.target.value)}
                  placeholder="e.g. Need to upload updated degree certificate and revised bank passbook with new IFSC code."
                  required
                  autoFocus
                />
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="ui-button secondary"
                  onClick={() => setEmployeeRevisionModal(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ui-button primary"
                  style={{ background: 'var(--teal)', borderColor: 'var(--teal)', color: '#fff', fontWeight: 600 }}
                  disabled={saving || !revisionRequestNote.trim()}
                >
                  {saving ? 'Submitting...' : 'Submit Revision Request'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

function DocumentCard({
  title,
  docKey,
  docData,
  numberLabel,
  numberValue,
  badge,
  onView,
  onVerifySingle,
  onRejectSingle,
  onQuickUpload,
  canEdit,
  isHRorAdmin,
  allowMultiple = false,
}) {
  const [showHistory, setShowHistory] = useState(false)
  const hasFile = Boolean(
    docData?.url ||
    docData?.fileName ||
    (Array.isArray(docData?.files) && docData.files.length > 0) ||
    docData?.status === 'submitted' ||
    docData?.status === 'verified' ||
    docData?.status === 'reupload_requested' ||
    docData?.status === 'rejected'
  )
  const isUploaded = hasFile
  const isVerified = docData?.status === 'verified' || docData?.status === 'approved'
  const isReuploadRequested = Boolean(
    docData?.reuploadRequested === true ||
    docData?.status === 'reupload_requested' ||
    docData?.status === 'rejected'
  )
  const isLocked = hasFile && !isReuploadRequested
  const fileCount = docData?.files?.length || (docData?.url ? 1 : 0)
  const docVersion = docData?.version || 1
  const historyList = Array.isArray(docData?.history) ? docData.history : []

  return (
    <div
      className="panel"
      style={{
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
        borderColor: isReuploadRequested ? '#fca5a5' : isVerified ? '#86efac' : undefined,
        background: isReuploadRequested ? '#fffbfb' : undefined,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <h5 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={15} style={{ color: isReuploadRequested ? '#dc2626' : isVerified ? '#16a34a' : isUploaded ? 'var(--teal)' : 'var(--text-secondary)' }} />
            {title}
            {isUploaded && (
              <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>
                v{docVersion}
              </span>
            )}
          </h5>
          {isVerified ? (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#dcfce7', color: '#15803d', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={10} /> VERIFIED · LOCKED
            </span>
          ) : isReuploadRequested ? (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#fee2e2', color: '#b91c1c', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={10} /> RE-UPLOAD REQUESTED
            </span>
          ) : isUploaded ? (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#e0f2fe', color: '#0369a1', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Lock size={10} /> SUBMITTED · LOCKED
            </span>
          ) : (
            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>
              PENDING UPLOAD
            </span>
          )}
        </div>

        {numberLabel && (
          <div style={{ fontSize: '11px', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>{numberLabel}: </span>
            <strong style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>{numberValue || 'Not registered'}</strong>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginTop: '4px' }}>
          {isVerified ? (
            <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <CheckCircle2 size={13} /> Verified by HR ({docData?.verifiedBy || 'HR'}) · Document is locked
            </span>
          ) : isReuploadRequested ? (
            <span style={{ color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <AlertCircle size={13} /> HR requested revision · Upload corrected copy
            </span>
          ) : isUploaded ? (
            <span style={{ color: '#0d9488', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
              <Clock size={13} /> {fileCount > 1 ? `${fileCount} Files Attached` : (docData?.fileName || 'Attached')} · Awaiting HR verification
            </span>
          ) : (
            <span style={{ color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> Pending Upload
            </span>
          )}
        </div>

        {/* HR Remarks Alert Box */}
        {isReuploadRequested && (docData?.reuploadRemarks || docData?.rejectionReason) && (
          <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '11px', color: '#991b1b', marginTop: '8px', lineHeight: '1.4' }}>
            <strong style={{ display: 'block', marginBottom: '2px' }}>⚠️ HR Correction Request / Remarks:</strong>
            {docData.reuploadRemarks || docData.rejectionReason}
          </div>
        )}

        {/* Version History Drawer Toggle */}
        {historyList.length > 0 && (
          <div style={{ marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: '10.5px', color: 'var(--teal)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
            >
              📜 {showHistory ? 'Hide' : 'View'} Version History ({historyList.length} prior {historyList.length === 1 ? 'version' : 'versions'})
            </button>
            {showHistory && (
              <div style={{ marginTop: '6px', padding: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '10.5px', display: 'grid', gap: '6px' }}>
                <div style={{ fontWeight: 700, color: '#334155' }}>Current: v{docVersion} · {docData?.fileName} ({docData?.size || 'Attached'})</div>
                {historyList.map((h, idx) => (
                  <div key={idx} style={{ padding: '4px 6px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', color: '#64748b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#1e293b' }}>v{h.version || (idx + 1)} · {h.fileName}</strong>
                      <span style={{ fontSize: '9.5px' }}>{h.uploadedAt || h.submittedAt?.slice(0, 10)}</span>
                    </div>
                    {(h.reuploadRemarks || h.rejectionReason) && (
                      <div style={{ color: '#b91c1c', marginTop: '2px', fontStyle: 'italic' }}>
                        Remarks: {h.reuploadRemarks || h.rejectionReason}
                      </div>
                    )}
                    {h.url && (
                      <button
                        type="button"
                        onClick={() => onView({ title: `${title} (v${h.version})`, fileName: h.fileName, url: h.url, size: h.size })}
                        style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontSize: '10px', cursor: 'pointer', marginTop: '3px', textDecoration: 'underline' }}
                      >
                        Preview v{h.version}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
        {isUploaded && (
          <button
            type="button"
            onClick={() => onView({ title, label: title, docKey, numberLabel, numberValue, ...docData })}
            className="ui-button secondary"
            style={{ flex: 1, minWidth: '100px', fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
          >
            <Eye size={12} /> View Document Preview
          </button>
        )}

        {/* EMPLOYEE CONTROLS: Strictly enforce locking */}
        {!isHRorAdmin && canEdit && onQuickUpload && (
          <>
            {isLocked ? (
              <div
                style={{
                  flex: 1,
                  minWidth: '120px',
                  fontSize: '11px',
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  borderRadius: '6px',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  userSelect: 'none',
                }}
                title={isVerified ? "This document is verified and locked by HR." : "Document submitted and awaiting HR verification. Replacement is locked."}
              >
                <Lock size={12} /> {isVerified ? 'Verified & Locked' : 'Submitted · Locked'}
              </div>
            ) : isReuploadRequested ? (
              <label
                style={{
                  flex: 1,
                  minWidth: '140px',
                  fontSize: '11px',
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  borderRadius: '6px',
                  border: '1px solid #fca5a5',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                title="HR has requested a re-upload for this document. Click to choose your corrected file."
              >
                <Upload size={12} /> Re-upload Corrected Document
                <input
                  type="file"
                  accept="*/*"
                  multiple={Boolean(allowMultiple)}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = allowMultiple ? e.target.files : e.target.files?.[0]
                    if (files) {
                      onQuickUpload(docKey, title, files)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
            ) : (
              <label
                style={{
                  flex: 1,
                  minWidth: '120px',
                  fontSize: '11px',
                  padding: '6px 10px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'rgba(0, 110, 111, 0.08)',
                  color: 'var(--teal)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
                title="Upload required document"
              >
                <Upload size={12} /> {allowMultiple ? 'Upload Files (Multiple)' : 'Upload File / Media'}
                <input
                  type="file"
                  accept="*/*"
                  multiple={Boolean(allowMultiple)}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = allowMultiple ? e.target.files : e.target.files?.[0]
                    if (files) {
                      onQuickUpload(docKey, title, files)
                      e.target.value = ''
                    }
                  }}
                />
              </label>
            )}
          </>
        )}

        {/* HR / ADMIN CONTROLS */}
        {isHRorAdmin && (
          <>
            {isUploaded && !isReuploadRequested && onRejectSingle && (
              <button
                type="button"
                onClick={() => onRejectSingle(docKey, title)}
                className="ui-button secondary"
                style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center', borderColor: '#fca5a5', color: '#b91c1c' }}
                title="Request re-upload / reject document with mandatory remarks"
              >
                <AlertCircle size={12} /> Request Re-upload
              </button>
            )}
            {isUploaded && !isVerified && onVerifySingle && (
              <button
                type="button"
                onClick={() => onVerifySingle(docKey, title)}
                className="ui-button primary"
                style={{ fontSize: '11px', padding: '6px 10px', justifyContent: 'center', background: '#059669', borderColor: '#059669', color: '#fff' }}
                title="Approve and verify this document"
              >
                <CheckCircle2 size={12} /> Approve Document
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function VerificationFormCard({
  template,
  docData,
  isVerified,
  canEdit,
  isHRorAdmin,
  onView,
  onQuickUpload,
  onVerifySingle,
  onRejectSingle,
}) {
  const hasFile = Boolean(
    docData?.status === 'submitted' ||
    docData?.status === 'verified' ||
    docData?.status === 'reupload_requested' ||
    docData?.status === 'rejected' ||
    docData?.url ||
    docData?.fileName
  )
  const isUploaded = hasFile
  const isDocVerified = docData?.status === 'verified' || isVerified
  const isReuploadRequested = Boolean(
    docData?.reuploadRequested === true ||
    docData?.status === 'reupload_requested' ||
    docData?.status === 'rejected'
  )
  const isLocked = hasFile && !isReuploadRequested
  const docVersion = docData?.version || 1
  const historyList = Array.isArray(docData?.history) ? docData.history : []

  return (
    <div
      className="panel"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '16px',
        borderRadius: '10px',
        border: isReuploadRequested ? '1px solid #fca5a5' : isDocVerified ? '1px solid #86efac' : '1px solid var(--border-color)',
        background: isReuploadRequested ? '#fffbfb' : isDocVerified ? '#fbfdfb' : '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div>
        {/* Top Badges & Category */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: template.fileType === 'PDF' ? '#fee2e2' : '#dbeafe',
              color: template.fileType === 'PDF' ? '#b91c1c' : '#1d4ed8',
              letterSpacing: '0.4px',
            }}
          >
            {template.fileType} • {template.sizeLabel}
          </span>

          {isDocVerified ? (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#dcfce7',
                color: '#15803d',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Lock size={11} /> VERIFIED & LOCKED
            </span>
          ) : isReuploadRequested ? (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#fee2e2',
                color: '#b91c1c',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertCircle size={11} /> RE-UPLOAD REQUESTED
            </span>
          ) : isUploaded ? (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#e0f2fe',
                color: '#0369a1',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Lock size={11} /> SUBMITTED · LOCKED
            </span>
          ) : (
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                background: '#f1f5f9',
                color: '#64748b',
              }}
            >
              PENDING UPLOAD
            </span>
          )}
        </div>

        {/* Title & Description */}
        <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileCheck2 size={16} style={{ color: isDocVerified ? '#16a34a' : 'var(--teal)' }} />
          {template.title}
          {isUploaded && (
            <span style={{ fontSize: '10px', padding: '1px 5px', borderRadius: '4px', background: '#f1f5f9', color: '#64748b', fontWeight: 600 }}>
              v{docVersion}
            </span>
          )}
        </h4>
        <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
          {template.description}
        </p>

        {/* Rejection / Reupload Remarks Note */}
        {isReuploadRequested && (docData?.reuploadRemarks || docData?.rejectionReason) && (
          <div style={{ padding: '8px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '11px', color: '#991b1b', marginBottom: '10px' }}>
            <strong>HR Correction Request:</strong> {docData.reuploadRemarks || docData.rejectionReason}
          </div>
        )}

        {/* Uploaded File Info */}
        {isUploaded && (
          <div style={{ padding: '8px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '11px', color: '#334155', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <CheckCircle2 size={13} style={{ color: '#0d9488', flexShrink: 0 }} />
              <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{docData?.fileName || template.fileName}</strong>
            </span>
            {docData?.size && <small style={{ color: '#64748b', flexShrink: 0 }}>{docData.size}</small>}
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div style={{ display: 'grid', gap: '10px' }}>
        {/* Step 1: Download Blank Form */}
        <a
          href={template.downloadUrl}
          download={template.fileName}
          className="ui-button secondary"
          style={{
            width: '100%',
            fontSize: '11px',
            padding: '7px 10px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            textDecoration: 'none',
            color: '#1e293b',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontWeight: 600,
          }}
          title="Download the official blank form template to fill and sign"
        >
          <Download size={13} /> Download Blank {template.fileType}
        </a>

        {/* Step 2: View and Upload Controls */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {isUploaded && (
            <button
              type="button"
              onClick={() => onView({ title: template.title, label: template.title, docKey: template.key, ...docData })}
              className="ui-button secondary"
              style={{ flex: 1, minWidth: '100px', fontSize: '11px', padding: '6px 8px', justifyContent: 'center' }}
            >
              <Eye size={12} /> View File
            </button>
          )}

          {/* Employee Upload / Lock Controls */}
          {!isHRorAdmin && canEdit && onQuickUpload && (
            <>
              {isLocked ? (
                <div
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    fontSize: '11px',
                    padding: '6px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f1f5f9',
                    color: '#64748b',
                    fontWeight: 600,
                    userSelect: 'none',
                  }}
                  title={isDocVerified ? "This form is verified and locked by HR." : "Form submitted and locked awaiting HR review."}
                >
                  <Lock size={12} /> {isDocVerified ? 'Verified & Locked' : 'Submitted · Locked'}
                </div>
              ) : isReuploadRequested ? (
                <label
                  style={{
                    flex: 1,
                    minWidth: '140px',
                    fontSize: '11px',
                    padding: '6px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    borderRadius: '6px',
                    border: '1px solid #fca5a5',
                    background: '#fef2f2',
                    color: '#b91c1c',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Upload corrected signed copy requested by HR"
                >
                  <Upload size={12} /> Re-upload Corrected Form
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onQuickUpload(template.key, template.title, e.target.files[0])
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
              ) : (
                <label
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    fontSize: '11px',
                    padding: '6px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(0, 110, 111, 0.08)',
                    color: 'var(--teal)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                  title="Upload your filled and signed copy"
                >
                  <Upload size={12} /> Upload Signed Copy
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        onQuickUpload(template.key, template.title, e.target.files[0])
                        e.target.value = ''
                      }
                    }}
                  />
                </label>
              )}
            </>
          )}

          {/* HR / Admin Controls */}
          {isHRorAdmin && (
            <>
              {isUploaded && !isReuploadRequested && onRejectSingle && (
                <button
                  type="button"
                  onClick={() => onRejectSingle(template.key, template.title)}
                  className="ui-button secondary"
                  style={{ fontSize: '11px', padding: '6px 8px', justifyContent: 'center', borderColor: '#fca5a5', color: '#b91c1c' }}
                  title="Request re-upload / reject form with mandatory remarks"
                >
                  <AlertCircle size={12} /> Request Re-upload
                </button>
              )}
              {isUploaded && !isDocVerified && onVerifySingle && (
                <button
                  type="button"
                  onClick={() => onVerifySingle(template.key, template.title)}
                  className="ui-button primary"
                  style={{ fontSize: '11px', padding: '6px 10px', justifyContent: 'center', background: '#059669', borderColor: '#059669', color: '#fff' }}
                  title="Approve and verify this form"
                >
                  <CheckCircle2 size={12} /> Approve Form
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
