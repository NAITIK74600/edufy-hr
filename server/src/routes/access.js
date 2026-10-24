import express from 'express'
import { PERMISSIONS } from '../auth/permissions.js'

export function createAccessRouter(auth) {
  const router = express.Router()
  router.get('/hr/dashboard', auth.authenticate, auth.requirePermission(PERMISSIONS.HR_DASHBOARD_READ), (request, response) => response.json({ success: true, data: { route: '/hr/dashboard', userId: request.auth.user.id } }))
  router.get('/hr/dashboard/summary', auth.authenticate, auth.requirePermission(PERMISSIONS.HR_DASHBOARD_READ), (request, response) => response.json({
    success: true,
    data: {
      source: 'unavailable',
      message: 'No HR data source is connected yet.',
      modules: { recruitment: false },
      metrics: [
        { key: 'activeHeadcount', label: 'Active headcount', value: null, status: 'unavailable', href: '/hr/people' },
        { key: 'onLeaveToday', label: 'On leave today', value: null, status: 'unavailable', href: '/hr/leave' },
        { key: 'pendingLeave', label: 'Pending leave requests', value: null, status: 'unavailable', href: '/hr/leave' },
        { key: 'attendanceExceptions', label: 'Attendance exceptions', value: null, status: 'unavailable', href: '/hr/attendance' },
        { key: 'upcomingHolidays', label: 'Upcoming holidays', value: null, status: 'unavailable', href: '/hr/holidays' },
        { key: 'openHelpdeskTickets', label: 'Open help-desk tickets', value: null, status: 'unavailable', href: '/hr/helpdesk' },
      ],
      recentActivity: [],
    },
  }))
  router.get('/employees', auth.authenticate, auth.requirePermission(PERMISSIONS.EMPLOYEES_READ), (request, response) => response.json({ success: true, data: [], meta: { page: 1, limit: 20, total: 0 } }))
  router.get('/payroll', auth.authenticate, auth.requirePermission(PERMISSIONS.PAYROLL_READ), (request, response) => response.json({ success: true, data: [] }))
  router.get('/team-leave/:employeeId', auth.authenticate, auth.requirePermission(PERMISSIONS.LEAVE_TEAM_READ), auth.requireManagerOf('employeeId'), (request, response) => response.json({ success: true, data: { employeeId: request.params.employeeId, route: '/team-leave' } }))
  return router
}
