with open('src/pages/LeaveManagementPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix line 314
target_314 = '''          <small style={{ color: 'var(--muted)', fontSize: '9px' }}>
            {request.employeeId} · {request.department || 'General'}{' '}
            {request.applicantRole && `(${request.applicantRole.replace('_', ' ')})`}
          </small>'''

replacement_314 = '''          <small style={{ color: 'var(--muted)', fontSize: '9px' }}>
            {(typeof request.employeeId === 'object' ? request.employeeId?.employeeId : request.employeeId) || request.employeeCode || 'N/A'} · {request.department || 'General'}{' '}
            {request.applicantRole && `(${request.applicantRole.replace('_', ' ')})`}
          </small>'''

assert target_314 in content, 'target_314 not found'
content = content.replace(target_314, replacement_314)

# 2. Fix line 1838
target_1838 = '''                        <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                          {r.employeeId} · {r.department || 'General'}
                        </div>'''

replacement_1838 = '''                        <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
                          {(typeof r.employeeId === 'object' ? r.employeeId?.employeeId : r.employeeId) || 'N/A'} · {r.department || 'General'}
                        </div>'''

assert target_1838 in content, 'target_1838 not found'
content = content.replace(target_1838, replacement_1838)

# 3. Fix lines 1540-1550 (myBalances)
target_my_bal = '''  const balancesRaw = storeState.leaveBalances ?? []
  const userEmpId = user?.employeeId
  const userId = user?.id || user?._id
  const myBalances = balancesRaw.filter((b) => {
    if (!b) return false
    if (typeof b.employeeId === 'object' && b.employeeId !== null) {
      return (userEmpId && b.employeeId.employeeId === userEmpId) || (userId && b.employeeId._id === userId)
    }
    return (userEmpId && b.employeeId === userEmpId) || (userId && b.employeeId === userId)
  })
  const balancesToMap = myBalances.length > 0 ? myBalances : balancesRaw.slice(0, 4)'''

replacement_my_bal = '''  const balancesRaw = storeState.leaveBalances ?? []
  const userEmpId = String(user?.employeeId || '').trim()
  const userId = String(user?.id || user?._id || '').trim()
  const isIntern = String(user?.role || '').toLowerCase().includes('intern') || String(user?.designation || '').toLowerCase().includes('intern')
  const defaultFallbackBalances = [
    { leaveType: 'casual', allowance: isIntern ? 0 : 1, used: 0, reserved: 0 },
    { leaveType: 'sick', allowance: 1, used: 0, reserved: 0 },
  ]
  const myBalances = balancesRaw.filter((b) => {
    if (!b) return false
    const bEmpObj = typeof b.employeeId === 'object' && b.employeeId !== null ? b.employeeId : null
    const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    return (userEmpId && (bEmpCode === userEmpId || bEmpId === userEmpId)) || (userId && (bEmpId === userId || bEmpCode === userId))
  })
  const balancesToMap = myBalances.length > 0 ? myBalances : defaultFallbackBalances'''

assert target_my_bal in content, 'target_my_bal not found'
content = content.replace(target_my_bal, replacement_my_bal)

# 4. Fix lines 780-796 (userBalances and getAvailDays)
target_avail = '''  const userBalances = balances.filter((b) => {
    if (typeof b.employeeId === 'object' && b.employeeId !== null) {
      return (userEmpId && b.employeeId.employeeId === userEmpId) || (userId && b.employeeId._id === userId)
    }
    return (userEmpId && b.employeeId === userEmpId) || (userId && b.employeeId === userId)
  })'''

replacement_avail = '''  const userEmpCode = String(userEmpId || '').trim()
  const userIdentifier = String(userId || '').trim()
  const userBalances = balances.filter((b) => {
    if (!b) return false
    const bEmpObj = typeof b.employeeId === 'object' && b.employeeId !== null ? b.employeeId : null
    const bEmpCode = String(bEmpObj?.employeeId || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    const bEmpId = String(bEmpObj?._id || bEmpObj?.id || (typeof b.employeeId === 'string' ? b.employeeId : '')).trim()
    return (userEmpCode && (bEmpCode === userEmpCode || bEmpId === userEmpCode)) || (userIdentifier && (bEmpId === userIdentifier || bEmpCode === userIdentifier))
  })'''

assert target_avail in content, 'target_avail not found'
content = content.replace(target_avail, replacement_avail)

with open('src/pages/LeaveManagementPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated LeaveManagementPage.jsx successfully')

