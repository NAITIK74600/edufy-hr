/**
 * Utility functions for generating dynamic time-of-day greetings
 * and formatted user greetings with personalized names.
 */

export function getTimeOfDayGreeting(customHour = null) {
  const hour = customHour !== null && customHour !== undefined ? customHour : new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  if (hour >= 17 && hour < 22) return 'Good evening'
  return 'Welcome back'
}

export function resolveUserDisplayName(user, employees = []) {
  if (!user) return 'Colleague'

  // If user object has a valid name that is not generic
  const isGeneric = (val) => !val || !val.trim() || ['team member', 'colleague', 'user', 'member'].includes(val.trim().toLowerCase())

  if (user.displayName && !isGeneric(user.displayName)) {
    return user.displayName.trim()
  }
  if (user.name && !isGeneric(user.name)) {
    return user.name.trim()
  }
  if (user.fullName && !isGeneric(user.fullName)) {
    return user.fullName.trim()
  }

  // Cross-reference with employee roster
  if (Array.isArray(employees) && employees.length > 0) {
    const matched = employees.find(
      (e) =>
        (user.id && (e.id === user.id || e._id === user.id || e.userId === user.id)) ||
        (user.employeeId && (e.employeeId === user.employeeId || e.id === user.employeeId)) ||
        (user.email && e.email && e.email.toLowerCase() === user.email.toLowerCase())
    )
    if (matched?.name && !isGeneric(matched.name)) return matched.name.trim()
    if (matched?.displayName && !isGeneric(matched.displayName)) return matched.displayName.trim()
  }

  if (user.username && !isGeneric(user.username)) {
    return user.username.trim()
  }
  if (user.email && typeof user.email === 'string') {
    const handle = user.email.split('@')[0]
    return handle.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return 'Colleague'
}

export function formatUserGreeting(userOrName, customHour = null, employees = []) {
  let name = typeof userOrName === 'object' ? resolveUserDisplayName(userOrName, employees) : userOrName
  if (typeof userOrName === 'object') {
    if (userOrName?.role === 'admin') name = 'Admin'
    else if (userOrName?.role === 'hr') name = 'HR'
  }
  const greeting = getTimeOfDayGreeting(customHour)
  return name ? `${greeting}, ${name}` : greeting
}

export function getRoleBadgeLabel(role) {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'managing_director':
      return 'Managing Director'
    case 'co_founder':
      return 'Co-Founder'
    case 'vertical_head':
      return 'Vertical Head'
    case 'revenue_growth_manager':
      return 'Revenue Growth Manager'
    case 'manager':
      return 'Manager'
    case 'team_leader':
    case 'team_lead':
      return 'Team Leader'
    case 'hr':
      return 'HR'
    case 'hr_executive':
      return 'HR Executive'
    case 'operations_executive':
      return 'Operations Executive'
    case 'business_development_executive':
      return 'BD Executive'
    case 'business_development_intern':
      return 'BD Intern'
    case 'marketing_executive':
      return 'Marketing Executive'
    case 'marketing_intern':
      return 'Marketing Intern'
    case 'sde':
    case 'sde_executive':
    case 'seo_executive':
      return 'SDE'
    case 'sde_intern':
    case 'seo_intern':
      return 'SDE Intern'
    case 'post_sales_executive':
      return 'Post-Sales Executive'
    case 'post_sales_intern':
      return 'Post-Sales Intern'
    case 'employee':
      return 'Employee ESS'
    default:
      return (role || 'Member').replace(/_/g, ' ')
  }
}
