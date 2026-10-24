import { apiClient } from './apiClient.js'

export const workspaceKeys = ['announcements', 'tasks', 'courses', 'enrollments', 'tickets', 'expenses', 'dailyReports', 'kudos', 'performanceGoals', 'performanceReviews', 'holidays', 'documents', 'requisitions', 'notifications', 'workspacePeople', 'roles', 'departments']

export function workspaceAction(store, handler) {
  return async (...args) => {
    try { return await handler(...args) } catch (error) {
      store.reportError(error)
      globalThis.alert?.(error.message)
    }
  }
}

export function createWorkspaceStore(store, mutate, getUser = null, rawLocal = {}) {
  const isLocal = () => getUser && !getUser()
  const pick = (data, fields) => Object.fromEntries(fields.filter((key) => data[key] !== undefined).map((key) => [key, data[key]]))
  function save(method, path, payload) {
    return mutate(() => apiClient[method](`/workspace${path}`, payload))
  }
  const create = (resource, data) => save('post', `/${resource}`, data)
  const patch = (resource, id, data) => save('patch', `/${resource}/${encodeURIComponent(id)}`, data)
  return {
    addTask: (data) => (isLocal() && rawLocal.addTask ? rawLocal.addTask(data) : create('tasks', pick(data, ['title', 'assigneeId', 'priority', 'category', 'dueDate']))),
    updateTaskStatus: (id, status) => (isLocal() && rawLocal.updateTaskStatus ? rawLocal.updateTaskStatus(id, status) : patch('tasks', id, { status })),
    submitDailyReport: (data) => (isLocal() && rawLocal.submitDailyReport ? rawLocal.submitDailyReport(data) : create('dailyReports', { ...pick(data, ['date', 'challenges', 'tomorrowPlan']), hoursLogged: Number(data.hoursLogged), tasksSummary: data.tasksSummary ?? data.summary })),
    deleteDailyReport: (id) => (isLocal() && rawLocal.deleteDailyReport ? rawLocal.deleteDailyReport(id) : save('delete', `/dailyReports/${encodeURIComponent(id)}`)),
    addCourse: (data) => (isLocal() && rawLocal.addCourse ? rawLocal.addCourse(data) : create('courses', pick(data, ['title', 'category', 'duration', 'url', 'modules']))),
    enrollCourse: (courseId) => (isLocal() && rawLocal.enrollCourse ? rawLocal.enrollCourse(courseId) : create('enrollments', { courseId })),
    updateCourseProgress: (courseId, progress) => {
      if (isLocal() && rawLocal.updateCourseProgress) return rawLocal.updateCourseProgress(courseId, progress)
      return mutate(async () => {
        const enrollment = (store.getState().enrollments ?? []).find((record) => String(record.courseId) === String(courseId))
        if (!enrollment) throw new Error('Enroll in this course before reporting progress.')
        return apiClient.patch(`/workspace/enrollments/${encodeURIComponent(enrollment.id)}`, { progress })
      })
    },
    completeCourseQuiz: () => Promise.reject(new Error('Verified quizzes and certificates are not configured. Use self-reported course progress instead.')),
    createTicket: (data) => (isLocal() && rawLocal.createTicket ? rawLocal.createTicket(data) : create('tickets', pick(data, ['subject', 'description', 'category', 'priority']))),
    createHelpDeskTicket(data) { return this.createTicket(data) },
    updateTicketStatus: (id, status) => (isLocal() && rawLocal.updateTicketStatus ? rawLocal.updateTicketStatus(id, status) : patch('tickets', id, { status })),
    replyToTicket: (id, response) => (isLocal() && rawLocal.replyToTicket ? rawLocal.replyToTicket(id, response) : patch('tickets', id, { response })),
    createAnnouncement: (data) => (isLocal() && rawLocal.createAnnouncement ? rawLocal.createAnnouncement(data) : create('announcements', pick(data, ['title', 'content', 'category', 'priority', 'targetAudience', 'pinned']))),
    updateAnnouncement: (id, data) => (isLocal() && rawLocal.updateAnnouncement ? rawLocal.updateAnnouncement(id, data) : patch('announcements', id, pick(data, ['title', 'content', 'category', 'priority', 'targetAudience', 'pinned']))),
    deleteAnnouncement: (id) => (isLocal() && rawLocal.deleteAnnouncement ? rawLocal.deleteAnnouncement(id) : save('delete', `/announcements/${encodeURIComponent(id)}`)),
    togglePinAnnouncement: (id, pinned) => (isLocal() && rawLocal.togglePinAnnouncement ? rawLocal.togglePinAnnouncement(id, pinned) : patch('announcements', id, { pinned })),
    likeAnnouncement: (id) => (isLocal() && rawLocal.likeAnnouncement ? rawLocal.likeAnnouncement(id) : patch('announcements', id, { liked: true })),
    addDocument: (data) => (isLocal() && rawLocal.addDocument ? rawLocal.addDocument(data) : create('documents', pick(data, ['title', 'category', 'size', 'url']))),
    deleteDocument: (id) => (isLocal() && rawLocal.deleteDocument ? rawLocal.deleteDocument(id) : save('delete', `/documents/${encodeURIComponent(id)}`)),
    addHoliday: (data) => (isLocal() && rawLocal.addHoliday ? rawLocal.addHoliday(data) : create('holidays', { ...pick(data, ['date', 'type']), name: data.name ?? data.title })),
    deleteHoliday: (id) => (isLocal() && rawLocal.deleteHoliday ? rawLocal.deleteHoliday(id) : save('delete', `/holidays/${encodeURIComponent(id)}`)),
    addRequisition: (data) => (isLocal() && rawLocal.addRequisition ? rawLocal.addRequisition(data) : create('requisitions', { ...pick(data, ['title', 'department', 'location']), openings: Number(data.openings) })),
    submitExpense: (data) => (isLocal() && rawLocal.submitExpense ? rawLocal.submitExpense(data) : create('expenses', { ...pick(data, ['category', 'merchant', 'date', 'attachmentUrl', 'attachmentName', 'attachmentType', 'attachmentSize']), amount: Number(data.amount), comments: data.comments ?? data.notes ?? '', attachmentUrl: data.attachmentUrl || '', attachmentName: data.attachmentName || '', attachmentType: data.attachmentType || '', attachmentSize: data.attachmentSize || '' })),
    approveExpense: (id) => (isLocal() && rawLocal.approveExpense ? rawLocal.approveExpense(id) : patch('expenses', id, { status: 'approved' })),
    rejectExpense: (id, reviewerRole, reason) => (isLocal() && rawLocal.rejectExpense ? rawLocal.rejectExpense(id, reviewerRole, reason) : patch('expenses', id, { status: 'rejected', rejectionReason: reason })),
    deleteExpense: (id) => (isLocal() && rawLocal.deleteExpense ? rawLocal.deleteExpense(id) : save('delete', `/expenses/${encodeURIComponent(id)}`)),
    sendKudos: (data) => (isLocal() && rawLocal.sendKudos ? rawLocal.sendKudos(data) : create('kudos', { recipientId: data.recipientId ?? data.to, badge: data.badge ?? data.tag, message: data.message })),
    addPerformanceGoal: (data) => (isLocal() && rawLocal.addPerformanceGoal ? rawLocal.addPerformanceGoal(data) : create('performanceGoals', pick(data, ['employeeId', 'title', 'target', 'dueDate', 'progress']))),
    updatePerformanceGoal: (id, progress) => (isLocal() && rawLocal.updatePerformanceGoal ? rawLocal.updatePerformanceGoal(id, progress) : patch('performanceGoals', id, { progress })),
    addNotification: (data) => {
      rawLocal.addNotification?.(data)
      if (isLocal()) return Promise.resolve(data)
      return create('notifications', pick(data, ['recipientId', 'recipientRole', 'title', 'message', 'type', 'id'])).catch((err) => {
        console.warn('Failed to sync notification to server:', err?.message || err)
        return data
      })
    },
    markNotificationRead: (id) => {
      rawLocal.markNotificationRead?.(id)
      return isLocal() ? Promise.resolve() : patch('notifications', id, { read: true })
    },
    markAllNotificationsRead: () => {
      rawLocal.markAllNotificationsRead?.()
      return isLocal() ? Promise.resolve() : save('patch', '/notifications/read-all', {})
    },
    deleteNotification: (id) => {
      rawLocal.deleteNotification?.(id)
      return isLocal() ? Promise.resolve() : save('delete', `/notifications/${encodeURIComponent(id)}`)
    },
    clearAllNotifications: () => {
      rawLocal.clearAllNotifications?.()
      return isLocal() ? Promise.resolve() : save('delete', '/notifications/clear-all')
    },
    addRole: (data) => (isLocal() && rawLocal.addRole ? rawLocal.addRole(data) : create('roles', pick(data, ['id', 'roleId', 'name', 'description', 'badge', 'isSystem', 'permissions']))),
    updateRole: (id, data) => (isLocal() && rawLocal.updateRole ? rawLocal.updateRole(id, data) : patch('roles', id, pick(data, ['name', 'description', 'badge', 'permissions']))),
    deleteRole: (id) => (isLocal() && rawLocal.deleteRole ? rawLocal.deleteRole(id) : save('delete', `/roles/${encodeURIComponent(id)}`)),
    addDepartment: (data) => (isLocal() && rawLocal.addDepartment ? rawLocal.addDepartment(data) : create('departments', pick(data, ['id', 'deptId', 'name', 'code', 'description', 'head', 'isCustom']))),
    updateDepartment: (id, data) => (isLocal() && rawLocal.updateDepartment ? rawLocal.updateDepartment(id, data) : patch('departments', id, pick(data, ['name', 'code', 'description', 'head']))),
    deleteDepartment: (id) => (isLocal() && rawLocal.deleteDepartment ? rawLocal.deleteDepartment(id) : save('delete', `/departments/${encodeURIComponent(id)}`)),
  }
}
