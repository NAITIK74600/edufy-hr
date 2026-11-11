import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../auth/AuthContext'
import { hrStore } from '../services/hrStore'
import { PageHeader } from '../components/ui'
import { formatINR } from '../utils/currency'
import { OnboardingDossierView } from '../components/OnboardingDossierView'
import { EmployeeComplianceStatusCard } from '../components/EmployeeComplianceStatusCard'
import { User, Mail, Phone, Building2, Calendar, ShieldCheck, Briefcase, Camera, Check, KeyRound, Fingerprint, Cake } from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { PasskeyModal } from '../components/PasskeyModal'
import { compressImageFile } from '../utils/imageCompressor'

export function EmployeeProfilePage() {
  const { user, updateUser } = useAuth()
  const [state, setState] = useState(() => hrStore.getState())
  const [photoNotice, setPhotoNotice] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false)
  const [dobModalOpen, setDobModalOpen] = useState(false)
  const [dobInput, setDobInput] = useState('')
  const [savingDob, setSavingDob] = useState(false)
  const [dobError, setDobError] = useState('')
  const [dobSuccessNotice, setDobSuccessNotice] = useState('')
  const fileInputRef = useRef(null)
  useEffect(() => hrStore.subscribe(setState), [])

  const employee = state.employees.find((record) => record.id === user?.id || record.employeeId === user?.employeeId) || state.employees[0]
  if (!employee) return <p role="alert">Your employee record is unavailable. Contact HR.</p>

  const rawDob = employee.dob || employee.identity?.dob
  let formattedDobInput = ''
  if (rawDob) {
    try {
      const d = new Date(rawDob)
      if (!isNaN(d.getTime())) {
        formattedDobInput = d.toISOString().split('T')[0]
      }
    } catch {}
  }

  async function handleSaveDob() {
    if (!dobInput) {
      setDobError('Please select a valid date of birth.')
      return
    }
    setSavingDob(true)
    setDobError('')
    try {
      if (hrStore.updateMyDob) {
        await hrStore.updateMyDob(dobInput)
      } else {
        await apiClient.patch('/employees/me/dob', { dob: dobInput })
      }
      setDobModalOpen(false)
      setDobSuccessNotice('Date of birth updated successfully! 🎂')
      setTimeout(() => setDobSuccessNotice(''), 4500)
    } catch (err) {
      setDobError(err.response?.data?.error?.message || err.message || 'Failed to save date of birth.')
    } finally {
      setSavingDob(false)
    }
  }

  async function handleClearDob() {
    if (!confirm('Are you sure you want to remove your date of birth?')) return
    setSavingDob(true)
    setDobError('')
    try {
      if (hrStore.updateMyDob) {
        await hrStore.updateMyDob(null)
      } else {
        await apiClient.patch('/employees/me/dob', { dob: null })
      }
      setDobInput('')
      setDobModalOpen(false)
      setDobSuccessNotice('Date of birth removed.')
      setTimeout(() => setDobSuccessNotice(''), 4500)
    } catch (err) {
      setDobError(err.response?.data?.error?.message || err.message || 'Failed to clear date of birth.')
    } finally {
      setSavingDob(false)
    }
  }

  const avatarUrl = user?.avatarUrl || employee?.avatarUrl || employee?.onboardingDocs?.passportPhoto?.url

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    try {
      // Compress client-side to max 384x384 JPEG (~30KB-50KB) to prevent MongoDB 16MB document size limit
      const dataUrl = await compressImageFile(file, 384, 384, 0.75)
      if (dataUrl) {
        if (hrStore.updateMyAvatar) {
          await hrStore.updateMyAvatar(dataUrl)
        } else {
          await apiClient.patch('/employees/me/avatar', { avatarUrl: dataUrl })
        }
        if (updateUser) updateUser({ avatarUrl: dataUrl })
        setPhotoNotice(true)
        setTimeout(() => setPhotoNotice(false), 4000)
      }
    } catch (err) {
      console.error('Failed to persist profile picture:', err.message)
      alert('Failed to save profile picture: ' + (err.message || 'Please try again.'))
    } finally {
      setUploadingPhoto(false)
      if (e.target) e.target.value = ''
    }
  }

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Employee Self-Service"
        title="My Profile & Onboarding Documents"
        description="View and manage your official employment record, identity credentials, statutory numbers, and onboarding verification documents."
      />

      {photoNotice && (
        <div style={{
          padding: '10px 16px',
          background: '#dcfce7',
          border: '1px solid #86efac',
          borderRadius: '8px',
          color: '#15803d',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Check size={16} />
          Profile picture updated and saved successfully!
        </div>
      )}

      {dobSuccessNotice && (
        <div style={{
          padding: '10px 16px',
          background: '#fdf2f8',
          border: '1px solid #fbcfe8',
          borderRadius: '8px',
          color: '#db2777',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Cake size={16} />
          {dobSuccessNotice}
        </div>
      )}

      {/* Main Profile Summary Card */}
      <section className="panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '78px', height: '78px' }}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={employee.name}
                style={{ width: '78px', height: '78px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--teal)' }}
              />
            ) : (
              <div style={{
                width: '78px', height: '78px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
                color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 700
              }}>
                {employee.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
              disabled={uploadingPhoto}
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--teal)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                border: '2px solid #fff',
              }}
            >
              <Camera size={13} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>{employee.name}</h2>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '12px',
                background: employee.status === 'active' ? '#dcfce7' : '#fef3c7',
                color: employee.status === 'active' ? '#15803d' : '#b45309'
              }}>
                {employee.status?.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {employee.designation || 'Pending Designation'} · {employee.department || 'Operations'} · ID: <strong style={{ color: 'var(--teal)' }}>{employee.employeeId}</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gap: '4px', textAlign: 'right', fontSize: '12px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Annual Salary Profile</span>
            <strong style={{ fontSize: '16px', color: 'var(--teal)' }}>{formatINR(employee.salary ?? 0)}</strong>
            <small style={{ color: 'var(--muted)', fontSize: '10px' }}>Final net pay reflected on monthly payslip</small>
          </div>
        </div>

        {/* Quick Info Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px',
          marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '12px'
        }}>
          <div><span style={{ color: 'var(--text-secondary)' }}>Official Email:</span> <strong>{employee.email}</strong></div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Phone Number:</span> <strong>{employee.phone || 'Not configured'}</strong></div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>Date of Birth:</span>{' '}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
              <strong>
                {employee.dob
                  ? new Date(employee.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                  : (employee.identity?.dob
                    ? new Date(employee.identity.dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : 'Not provided')}
              </strong>
              <button
                type="button"
                onClick={() => {
                  setDobInput(formattedDobInput)
                  setDobError('')
                  setDobModalOpen(true)
                }}
                title="Update Date of Birth"
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid #fbcfe8',
                  background: '#fdf2f8',
                  color: '#db2777',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Cake size={12} /> {rawDob ? 'Edit' : 'Fill Birthday'}
              </button>
            </div>
          </div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Joining Date:</span> <strong>{employee.joiningDate}</strong></div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Reporting Manager:</span> <strong>{employee.managerName || 'Company Executive'}</strong></div>
          <div><span style={{ color: 'var(--text-secondary)' }}>Employment Type:</span> <strong style={{ textTransform: 'capitalize' }}>{employee.employmentType?.replace('_', ' ') || 'Full time'}</strong></div>
        </div>
      </section>

      {/* Policy Consent, Document Policy & NDA Status (HR & Admin Only) */}
      {['admin', 'hr', 'superadmin'].includes(String(user?.role || '').toLowerCase()) && (
        <EmployeeComplianceStatusCard employee={employee} />
      )}

      {/* Security & Password Credentials Section */}
      <section className="panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={18} style={{ color: 'var(--teal)' }} /> Account Security & Password
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
              Manage your personal corporate portal access password and security credentials.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ui-button secondary"
              onClick={() => setPasskeyModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <Fingerprint size={14} style={{ color: 'var(--teal)' }} /> Passkeys & Biometrics
            </button>
            <button
              type="button"
              className="ui-button primary"
              onClick={() => setPasswordModalOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <KeyRound size={14} /> Change Password
            </button>
          </div>
        </div>
      </section>

      {/* Onboarding Documents & Statutory Dossier Section */}
      <section className="panel" style={{ padding: '22px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--teal)' }} /> Official Onboarding Documents & Verification
        </h3>
        <OnboardingDossierView employee={employee} canEdit={true} canVerify={false} />
      </section>

      {/* Change Password Modal */}
      {passwordModalOpen && (
        <ChangePasswordModal
          isOpen={true}
          isForced={false}
          onClose={() => setPasswordModalOpen(false)}
        />
      )}

      {/* Passkeys & Biometrics Modal */}
      <PasskeyModal
        isOpen={passkeyModalOpen}
        onClose={() => setPasskeyModalOpen(false)}
      />

      {/* Date of Birth & Birthday Self-Service Modal */}
      {dobModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dob-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1100,
            display: 'grid',
            placeItems: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !savingDob) setDobModalOpen(false)
          }}
        >
          <div
            className="panel"
            style={{
              maxWidth: '430px',
              width: '100%',
              padding: '24px',
              borderRadius: '14px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              position: 'relative',
              background: 'var(--card-bg, #ffffff)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 id="dob-modal-title" style={{ margin: 0, fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cake size={20} style={{ color: '#db2777' }} /> Date of Birth
              </h3>
              <button
                type="button"
                disabled={savingDob}
                onClick={() => setDobModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: 'var(--muted, #64748b)',
                  lineHeight: 1,
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {dobError && (
              <div
                style={{
                  padding: '9px 12px',
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fca5a5',
                  borderRadius: '7px',
                  fontSize: '12px',
                  marginBottom: '14px',
                  fontWeight: 500,
                }}
              >
                {dobError}
              </div>
            )}

            <div style={{ display: 'grid', gap: '6px', marginBottom: '22px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Date of Birth
              </label>
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={dobInput}
                onChange={(e) => setDobInput(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {rawDob ? (
                <button
                  type="button"
                  disabled={savingDob}
                  onClick={handleClearDob}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    background: '#fff',
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  Clear Birthday
                </button>
              ) : <span />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={savingDob}
                  onClick={() => setDobModalOpen(false)}
                  className="ui-button secondary"
                  style={{ fontSize: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingDob || !dobInput}
                  onClick={handleSaveDob}
                  className="ui-button primary"
                  style={{
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#db2777',
                    borderColor: '#db2777',
                  }}
                >
                  <Cake size={13} /> {savingDob ? 'Saving...' : 'Save Birthday'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
