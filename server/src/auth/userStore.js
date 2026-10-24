function publicUser(user) {
  const { passwordHash, ...safeUser } = user
  return safeUser
}

export function createUserStore(users = []) {
  const records = new Map()
  const byEmail = new Map()
  const byEmployeeId = new Map()
  const byUsername = new Map()

  function registerUser(user) {
    const id = String(user.id)
    records.set(id, { ...user })
    if (user.email) {
      const emailLower = user.email.toLowerCase().trim()
      byEmail.set(emailLower, id)
      if (emailLower.includes('@')) {
        const usernamePart = emailLower.split('@')[0].toLowerCase().trim()
        byUsername.set(usernamePart, id)
      }
    }
    if (user.employeeId) {
      byEmployeeId.set(user.employeeId.toLowerCase().trim(), id)
    }
    if (user.username) {
      const uLower = user.username.toLowerCase().trim()
      byUsername.set(uLower, id)
    }
    if (user.name) {
      byUsername.set(user.name.toLowerCase().trim(), id)
      byUsername.set(user.name.toLowerCase().trim().replace(/\s+/g, '.'), id)
      byUsername.set(user.name.toLowerCase().trim().replace(/\s+/g, '_'), id)
    }
    if (user.displayName) {
      byUsername.set(user.displayName.toLowerCase().trim(), id)
      byUsername.set(user.displayName.toLowerCase().trim().replace(/\s+/g, '.'), id)
      byUsername.set(user.displayName.toLowerCase().trim().replace(/\s+/g, '_'), id)
    }
  }

  for (const user of users) {
    registerUser(user)
  }

  return {
    async listUsers() {
      return [...records.values()].map(publicUser)
    },
    addUser(user) {
      registerUser(user)
      return records.get(String(user.id))
    },
    async findByEmail(identifier) {
      if (!identifier) return null
      const clean = String(identifier).trim().toLowerCase()
      const id = byEmail.get(clean) || byUsername.get(clean) || byEmployeeId.get(clean)
      return id ? records.get(id) ?? null : null
    },
    async findById(id) {
      return records.get(String(id)) ?? null
    },
    async getPublicById(id) {
      const user = records.get(String(id))
      return user ? publicUser(user) : null
    },
    async resetPassword(id, passwordHash) {
      const user = records.get(String(id))
      if (user) {
        user.passwordHash = passwordHash
        return publicUser(user)
      }
      return null
    },
    async updateUser(id, updates) {
      const user = records.get(String(id))
      if (user) {
        Object.assign(user, updates)
        return publicUser(user)
      }
      return null
    },
    async deleteUser(id) {
      return records.delete(String(id))
    },
    async isManagerOf(managerId, employeeId) {
      const employee = records.get(String(employeeId))
      return Boolean(employee && employee.managerId && String(employee.managerId) === String(managerId) && employee.status === 'active')
    },
  }
}

export function parseUsersFromEnvironment(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) throw new Error('AUTH_USERS_JSON must be an array')
    return parsed
  } catch {
    throw new Error('AUTH_USERS_JSON must contain valid JSON user records')
  }
}
