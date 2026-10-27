import mongoose from 'mongoose'
import { Employee } from '../../models/Employee.js'
import { PayrollRecord } from '../../models/PayrollRecord.js'
import { AttendanceRecord } from '../../models/AttendanceRecord.js'
import { LeaveRequest } from '../../models/LeaveRequest.js'
import { workspaceModels } from '../../models/Workspace.js'
import { ensureConnected } from '../leave/leave.repository.js'

const titles = {
  'leave.submitted': 'Leave request submitted',
  'leave.hr_review_required': 'Leave review required',
  'leave.admin_review_required': 'Admin LOP approval required',
  'leave.pending_hr': 'Leave awaiting HR review',
  'leave.pending_admin': 'Leave awaiting Admin sign-off',
  'leave.approved': 'Leave approved',
  'leave.rejected': 'Leave rejected',
  'leave.cancelled': 'Leave cancelled',
  'payroll.processed': 'Payslip available',
  'attendance.checked_in': 'Attendance check-in saved',
  'attendance.checked_out': 'Attendance check-out saved',
  'attendance.updated': 'Attendance updated',
}

export async function notifyWorkspaceEvent({ recipientId, event, entityId, message }) {
  ensureConnected()
  const recipient = String(recipientId ?? '')
  const entity = String(entityId ?? '')
  if (!mongoose.isValidObjectId(recipient) || !mongoose.isValidObjectId(entity) || !Object.hasOwn(titles, event) || typeof message !== 'string' || !message.trim() || message.length > 10000) {
    throw Object.assign(new Error('A notification requires a real employee/entity ID, supported event and message.'), { statusCode: 400, code: 'NOTIFICATION_VALIDATION_ERROR' })
  }
  const employee = await Employee.findById(recipient).select('employeeId role').lean()
  if (!employee) throw Object.assign(new Error('Notification recipient employee does not exist.'), { statusCode: 404, code: 'NOTIFICATION_RECIPIENT_NOT_FOUND' })
  const kind = event.split('.')[0]
  const source = kind === 'payroll'
    ? await PayrollRecord.exists({ _id: entity, employeeRef: recipient, status: 'processed' })
    : kind === 'attendance'
      ? await AttendanceRecord.exists({ _id: entity, employeeId: employee.employeeId })
      : await LeaveRequest.exists({ _id: entity, ...(['admin', 'hr'].includes(employee.role) ? {} : { $or: [{ employeeId: recipient }, { managerId: recipient }] }) })
  if (!source) throw Object.assign(new Error('The persisted notification source does not exist or is not available to this recipient.'), { statusCode: 404, code: 'NOTIFICATION_SOURCE_NOT_FOUND' })
  const dedupeKey = `${recipient}:${event}:${entity}`
  const record = await workspaceModels.notifications.findOneAndUpdate(
    { dedupeKey },
    { $setOnInsert: { ownerId: recipient, title: titles[event], message: message.trim(), type: event.split('.')[0], event, entityId: entity, read: false } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  ).lean()
  return { ...record, id: String(record._id) }
}

export const workspaceNotificationService = { notify: notifyWorkspaceEvent }
