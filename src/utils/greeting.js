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

export function formatUserGreeting(userOrName, customHour = null) {
  let name = typeof userOrName === 'object' ? userOrName?.displayName || userOrName?.name : userOrName
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
