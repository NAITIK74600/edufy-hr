const DEFAULT_POLICIES = [
  { leaveType: 'casual', label: 'Casual Leave (CL)', maxDaysPerYear: 12, requiresManagerApproval: true, requiresHrReview: false, noticeDays: 1 },
  { leaveType: 'sick', label: 'Sick / Medical Leave (SL)', maxDaysPerYear: 10, requiresManagerApproval: true, requiresHrReview: false, noticeDays: 0 },
  { leaveType: 'earned', label: 'Earned / Privilege Leave (EL)', maxDaysPerYear: 15, requiresManagerApproval: true, requiresHrReview: true, noticeDays: 7 },
  { leaveType: 'comp_off', label: 'Compensatory Off', maxDaysPerYear: 5, requiresManagerApproval: true, requiresHrReview: false, noticeDays: 1 },
]

const DEFAULT_BALANCES = [
  { employeeId: 'dev-emp-1', leaveType: 'casual', allocated: 12, used: 2, reserved: 0, remaining: 10, year: 2026 },
  { employeeId: 'dev-emp-1', leaveType: 'sick', allocated: 10, used: 1, reserved: 0, remaining: 9, year: 2026 },
  { employeeId: 'dev-emp-1', leaveType: 'earned', allocated: 15, used: 4, reserved: 0, remaining: 11, year: 2026 },
  { employeeId: 'dev-emp-1', leaveType: 'comp_off', allocated: 5, used: 0, reserved: 0, remaining: 5, year: 2026 },
  { employeeId: 'dev-mgr-1', leaveType: 'casual', allocated: 12, used: 1, reserved: 0, remaining: 11, year: 2026 },
  { employeeId: 'dev-mgr-1', leaveType: 'sick', allocated: 10, used: 0, reserved: 0, remaining: 10, year: 2026 },
  { employeeId: 'dev-mgr-1', leaveType: 'earned', allocated: 15, used: 3, reserved: 0, remaining: 12, year: 2026 },
]

const DEFAULT_REQUESTS = [
  {
    id: 'leave-101',
    employeeId: 'dev-emp-1',
    employeeName: 'Chandana Somaih',
    managerId: 'dev-mgr-1',
    leaveType: 'casual',
    startDate: new Date('2026-10-05'),
    endDate: new Date('2026-10-06'),
    days: 2,
    reason: 'Family wedding event in hometown.',
    status: 'pending_manager',
    comments: [],
    approvalHistory: [
      { action: 'submitted', actorId: 'dev-emp-1', actorRole: 'employee', comment: 'Request submitted.', createdAt: new Date('2026-09-28') }
    ],
    createdAt: new Date('2026-09-28')
  },
  {
    id: 'leave-102',
    employeeId: 'dev-emp-1',
    employeeName: 'Chandana Somaih',
    managerId: 'dev-mgr-1',
    leaveType: 'sick',
    startDate: new Date('2026-09-22'),
    endDate: new Date('2026-09-22'),
    days: 1,
    reason: 'Viral fever rest recovery.',
    status: 'approved',
    managerComment: 'Approved. Get well soon.',
    comments: [],
    approvalHistory: [
      { action: 'submitted', actorId: 'dev-emp-1', actorRole: 'employee', comment: 'Request submitted.', createdAt: new Date('2026-09-21') },
      { action: 'approved', actorId: 'dev-mgr-1', actorRole: 'manager', comment: 'Approved. Get well soon.', createdAt: new Date('2026-09-21') }
    ],
    createdAt: new Date('2026-09-21')
  }
]

let requests = [...DEFAULT_REQUESTS]
let balances = [...DEFAULT_BALANCES]
let policies = [...DEFAULT_POLICIES]
let notifications = []

export function createMemoryLeaveRepository() {
  return {
    async listRequests(filters = {}) {
      return requests.filter((r) =>
        (!filters.employeeId || r.employeeId === filters.employeeId) &&
        (!filters.managerId || r.managerId === filters.managerId) &&
        (!filters.status || r.status === filters.status) &&
        (!filters.leaveType || r.leaveType === filters.leaveType)
      )
    },
    async findRequest(id) {
      return requests.find((r) => r.id === id) ?? null
    },
    async createRequest(data) {
      const request = {
        id: `leave-${requests.length + 101}`,
        ...data,
        comments: data.comments ?? [],
        approvalHistory: data.approvalHistory ?? [],
        createdAt: new Date(),
      }
      requests.push(request)
      return request
    },
    async transitionRequest(id, expectedStatuses, update) {
      const request = requests.find((entry) => entry.id === id && expectedStatuses.includes(entry.status))
      if (!request) return null
      Object.assign(request, update.set ?? {})
      if (update.push) request.approvalHistory.push(update.push)
      return request
    },
    async appendComment(id, comment) {
      const request = requests.find((entry) => entry.id === id)
      if (!request) return null
      request.comments.push(comment)
      request.approvalHistory.push({
        action: 'commented',
        actorId: comment.actorId,
        actorRole: comment.actorRole,
        comment: comment.body,
        createdAt: new Date(),
      })
      return request
    },
    async findOverlap({ employeeId, startDate, endDate, excludeId }) {
      return (
        requests.find(
          (r) =>
            r.employeeId === employeeId &&
            r.id !== excludeId &&
            ['pending_tl', 'pending_manager', 'pending_director', 'pending_hr', 'pending_admin', 'approved'].includes(r.status) &&
            new Date(r.startDate) <= endDate &&
            new Date(r.endDate) >= startDate
        ) ?? null
      )
    },
    async getPolicy(leaveType) {
      return policies.find((p) => p.leaveType === leaveType) ?? null
    },
    async listPolicies() {
      return policies
    },
    async savePolicy(leaveType, values) {
      const policy = { leaveType, ...values }
      policies = policies.filter((entry) => entry.leaveType !== leaveType).concat(policy)
      return policy
    },
    async getBalance(employeeId, leaveType) {
      return balances.find((b) => b.employeeId === employeeId && b.leaveType === leaveType) ?? null
    },
    async listBalances(filters = {}) {
      return balances.filter(
        (b) => (!filters.employeeId || b.employeeId === filters.employeeId) &&
               (!filters.year || b.year === filters.year)
      )
    },
    async reserveBalance(employeeId, leaveType, year, days) {
      const balance = balances.find((b) => b.employeeId === employeeId && b.leaveType === leaveType)
      if (balance) {
        balance.reserved = (balance.reserved ?? 0) + days
        balance.remaining = Math.max(0, balance.allocated - balance.used - balance.reserved)
      }
    },
    async releaseReservation(employeeId, leaveType, year, days) {
      const balance = balances.find((b) => b.employeeId === employeeId && b.leaveType === leaveType)
      if (balance) {
        balance.reserved = Math.max(0, (balance.reserved ?? 0) - days)
        balance.remaining = Math.max(0, balance.allocated - balance.used - balance.reserved)
      }
    },
    async commitReservation(employeeId, leaveType, year, days) {
      const balance = balances.find((b) => b.employeeId === employeeId && b.leaveType === leaveType)
      if (balance) {
        balance.reserved = Math.max(0, (balance.reserved ?? 0) - days)
        balance.used = (balance.used ?? 0) + days
        balance.remaining = Math.max(0, balance.allocated - balance.used - balance.reserved)
      }
    },
    async restoreCommittedBalance(employeeId, leaveType, year, days) {
      const balance = balances.find((b) => b.employeeId === employeeId && b.leaveType === leaveType)
      if (balance) {
        balance.used = Math.max(0, (balance.used ?? 0) - days)
        balance.remaining = Math.max(0, balance.allocated - balance.used - balance.reserved)
      }
    },
    async deleteRequest(id) {
      const index = requests.findIndex((r) => r.id === String(id) || r._id === String(id))
      if (index >= 0) return requests.splice(index, 1)[0]
      return null
    },
    async notify(event) {
      notifications.push({ id: `notif-${notifications.length + 1}`, createdAt: new Date(), ...event })
    },
  }
}
