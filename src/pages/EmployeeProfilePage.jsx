import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { hrStore } from '../services/hrStore'
import { PageHeader } from '../components/ui'
import { formatINR } from '../utils/currency'
import { OnboardingDossierView } from '../components/OnboardingDossierView'
import { User, Mail, Phone, Building2, Calendar, ShieldCheck, Briefcase } from 'lucide-react'

export function EmployeeProfilePage() {
  const { user } = useAuth()
  const [state, setState] = useState(() => hrStore.getState())
  useEffect(() => hrStore.subscribe(setState), [])

  const employee = state.employees.find((record) => record.id === user?.id || record.employeeId === user?.employeeId) || state.employees[0]
  if (!employee) return <p role="alert">Your employee record is unavailable. Contact HR.</p>

  const passportPhotoUrl = employee?.onboardingDocs?.passportPhoto?.url

  return (
    <div style={{ display: 'grid', gap: '22px' }}>
      <PageHeader
        eyebrow="Employee Self-Service"
        title="My Profile & Onboarding Documents"
        description="View and manage your official employment record, identity credentials, statutory numbers, and onboarding verification documents."
      />

      {/* Main Profile Summary Card */}
      <section className="panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          {passportPhotoUrl ? (
            <img
              src={passportPhotoUrl}
              alt={employee.name}
              style={{ width: '74px', height: '74px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--teal)' }}
            />
          ) : (
            <div style={{
              width: '74px', height: '74px', borderRadius: '50%', background: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
              color: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '24px', fontWeight: 700
            }}>
              {employee.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
          )}

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

      {/* Onboarding Documents & Statutory Dossier Section */}
      <section className="panel" style={{ padding: '22px' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} style={{ color: 'var(--teal)' }} /> Official Onboarding Documents & Verification
        </h3>
        <OnboardingDossierView employee={employee} canEdit={true} canVerify={false} />
      </section>
    </div>
  )
}
