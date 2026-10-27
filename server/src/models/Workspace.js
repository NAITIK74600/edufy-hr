import mongoose from 'mongoose'

const text = { type: String, trim: true, maxlength: 10000 }
const longText = { type: String, trim: true, default: null }
const ownerId = { type: String, ref: 'Employee', required: true, index: true }
function model(name, fields, indexes = []) {
  const schema = new mongoose.Schema(fields, { timestamps: true, strict: 'throw' })
  for (const index of indexes) schema.index(index, { unique: true })
  return mongoose.models[name] ?? mongoose.model(name, schema)
}

export const workspaceModels = {
  announcements: model('WorkspaceAnnouncement', { ownerId, author: text, title: text, content: text, category: text, priority: text, targetAudience: text, pinned: Boolean, date: String, likedBy: [String] }),
  tasks: model('WorkspaceTask', { ownerId, assignedBy: text, assigneeRef: { type: String, ref: 'Employee', required: true, index: true }, assigneeId: text, assigneeName: text, title: text, priority: text, category: text, dueDate: String, status: String }),
  courses: model('WorkspaceCourse', { ownerId, title: text, category: text, duration: text, url: text, modules: [String] }),
  enrollments: model('WorkspaceEnrollment', { ownerId, courseId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'WorkspaceCourse' }, progress: Number, completedAt: Date }, [{ ownerId: 1, courseId: 1 }]),
  tickets: model('WorkspaceTicket', { ownerId, employeeId: text, employeeName: text, subject: text, description: text, category: text, priority: text, status: String, responses: [{ sender: text, text, time: Date }] }),
  expenses: model('WorkspaceExpense', { ownerId, employeeId: text, employeeName: text, category: text, amount: Number, merchant: text, date: String, comments: text, status: String, reviewerId: String, rejectionReason: text, attachmentUrl: longText, attachmentName: text, attachmentType: text, attachmentSize: text }),
  dailyReports: model('WorkspaceDailyReport', { ownerId, employeeId: text, employeeName: text, date: String, hoursLogged: Number, tasksSummary: text, challenges: text, tomorrowPlan: text }, [{ ownerId: 1, date: 1 }]),
  kudos: model('WorkspaceKudos', { ownerId, recipientId: { type: String, ref: 'Employee', required: true, index: true }, from: text, to: text, badge: text, message: text, date: String }),
  performanceGoals: model('WorkspacePerformanceGoal', { ownerId, employeeRef: { type: String, ref: 'Employee', required: true, index: true }, employeeName: text, title: text, target: text, dueDate: String, progress: Number }),
  performanceReviews: model('WorkspacePerformanceReview', { ownerId, employeeRef: { type: String, ref: 'Employee', required: true, index: true }, employeeName: text, period: text, rating: Number, comments: text, reviewerName: text }),
  holidays: model('WorkspaceHoliday', { ownerId, name: text, title: text, date: String, day: text, type: text }),
  documents: model('WorkspaceDocument', { ownerId, title: text, category: text, url: longText, size: text, date: String }),
  requisitions: model('WorkspaceRequisition', { ownerId, title: text, department: text, location: text, openings: Number, status: String }),
  notifications: model('WorkspaceNotification', { ownerId, recipientId: String, title: text, message: text, type: text, read: Boolean, event: String, entityId: String, dedupeKey: { type: String, unique: true, sparse: true }, recipientRole: text }),
  roles: model('WorkspaceRole', { ownerId, roleId: text, name: text, description: text, badge: text, isSystem: Boolean, permissions: [String] }),
  departments: model('WorkspaceDepartment', { ownerId, deptId: text, name: text, code: text, description: text, head: text, isCustom: Boolean }),
}
