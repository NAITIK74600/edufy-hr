import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../auth/AuthContext'
import { hrStore } from '../services/hrStore'
import { PageHeader } from '../components/ui'
import { formatINR } from '../utils/currency'
import { OnboardingDossierView } from '../components/OnboardingDossierView'
import { EmployeeComplianceStatusCard } from '../components/EmployeeComplianceStatusCard'
import { User, Mail, Phone, Building2, Calendar, ShieldCheck, Briefcase, Camera, Check, KeyRound, Fingerprint } from 'lucide-react'
import { apiClient } from '../services/apiClient'
import { ChangePasswordModal } from '../components/ChangePasswordModal'
import { PasskeyModal } from '../components/PasskeyModal'

export function EmployeeProfilePage() {
  const { user, updateUser } = useAuth()
  const [state, setState] = useState(() => hrStore.getState())
  const [photoNotice, setPhotoNotice] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false)
  const fileInputRef = useRef(null)
  useEffect(() => hrStore.subscribe(setState), [])

  const employee = state.employees.find((record) => record.id === user?.id || record.employeeId === user?.employeeId) || state.employees[0]
  if (!employee) return <p role="alert">Your employee record is unavailable. Contact HR.</p>

  const avatarUrl = user?.avatarUrl || employee?.avatarUrl || employee?.onboardingDocs?.passportPhoto?.url

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target.result
      if (dataUrl) {
        try {
          if (hrStore.updateMyAvatar) {
            await hrStore.updateMyAvatar(dataUrl)
          } else {
            await apiClient.patch('/employees/me/avatar', { avatarUrl: dataUrl })
          }
          if (updateUser) updateUser({ avatarUrl: dataUrl })
          setPhotoNotice(true)
          setTimeout(() => setPhotoNotice(false), 4000)
        } catch (err) {
          console.error('Failed to persist profile picture:', err.message)
          alert('Failed to save profile picture: ' + (err.message || 'Please try again.'))
        }
      }
      setUploadingPhoto(false)
    }
    reader.onerror = () => setUploadingPhoto(false)
    reader.readAsDataURL(file)
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
              {employee.designation || 'Staff Member'} · {employee.department || 'Operations'} · ID: <strong style={{ color: 'var(--teal)' }}>{employee.employeeId}</strong>
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
    </div>
  )
}
