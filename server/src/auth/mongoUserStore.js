import mongoose from 'mongoose'
import { Employee } from '../models/Employee.js'
import { attachOnboardingDocs } from '../models/onboardingDocsCache.js'

function toAuthUser(user) {
  if (!user) return null
  const displayName = user.displayName || user.name || user.username || (user.email ? user.email.split('@')[0] : 'Employee')
  return { ...user, id: String(user._id), displayName, name: user.name || displayName }
}

function toPublicUser(user) {
  if (!user) return null
  const source = user.toObject ? user.toObject() : user
  delete source.passwordHash
  delete source.authVersion
  const displayName = source.displayName || source.name || source.username || (source.email ? source.email.split('@')[0] : 'Employee')
  return { ...source, displayName, name: source.name || displayName, mustChangePassword: Boolean(source.mustChangePassword) }
}

export function createMongoUserStore({ managementUsers = [] } = {}) {
  let initialization
  const userCache = new Map()
  const USER_TTL_MS = 8000 // 8-second short auth-user cache

  function clearUserCache(idOrEmail) {
    if (!idOrEmail) {
      userCache.clear()
      return
    }
    const clean = String(idOrEmail).trim().toLowerCase()
    userCache.delete(clean)
    userCache.delete(`id:${clean}`)
    userCache.delete(`email:${clean}`)
    for (const [k, v] of userCache) {
      if (k.includes(clean)) userCache.delete(k)
    }
  }

  function ensureConnected() {
    if (mongoose.connection.readyState !== 1) {
      throw Object.assign(new Error('MongoDB is unavailable. Accounts cannot be loaded or saved.'), { statusCode: 503, code: 'DATABASE_UNAVAILABLE' })
    }
  }
  async function initialize() {
    ensureConnected()
    initialization ??= (async () => {
      await Employee.init()
      for (const { id, ...user } of managementUsers) {
        const existing = await Employee.findOne({ $or: [{ email: user.email }, { employeeId: user.employeeId }] }).lean()
        if (existing && existing.role !== user.role && existing.employeeId !== user.employeeId) {
          throw Object.assign(new Error(`Configured ${user.role} email conflicts with an existing employee. Resolve the duplicate before starting.`), { statusCode: 409, code: 'MANAGEMENT_ACCOUNT_CONFLICT' })
        }
        const { passwordHash, permissions, role, username, status, ...profile } = user
        if (existing) {
          await Employee.updateOne(
            { _id: existing._id },
            { $set: { email: user.email, passwordHash, permissions, role, username, status: 'active' } }
          )
        } else {
          await Employee.findOneAndUpdate(
            { email: user.email },
            { $set: { passwordHash, permissions, role, username, status: 'active' }, $setOnInsert: { ...profile, joiningDate: new Date() } },
            { upsert: true, returnDocument: 'after', runValidators: true },
          )
        }
      }
    })()
    return initialization
  }
  return {
    initialize,
    clearUserCache,
    async listUsers() {
      await initialize()
      const users = await Employee.find({
        $or: [
          { passwordHash: { $exists: true } },
          { email: { $in: managementUsers.map(({ email }) => email) } },
          { role: { $in: ['admin', 'director', 'hr', 'manager', 'team_lead', 'employee'] } },
        ],
      }).lean()
      await attachOnboardingDocs(users)
      return users.map((user) => toPublicUser(toAuthUser(user)))
    },
    async addUser(userData) {
      await initialize()
      const cleanEmail = String(userData.email).trim().toLowerCase()
      let cleanEmpId = String(userData.employeeId || '').trim().toUpperCase()

      try {
        // 1. Check if an account already exists with this email (e.g. created by HR or preexisting)
        const existingByEmail = await Employee.findOne({ email: cleanEmail }).select('+passwordHash')
        if (existingByEmail) {
          const updates = {
            status: 'active',
          }
          if (userData.passwordHash) updates.passwordHash = userData.passwordHash
          if (userData.role) updates.role = userData.role
          if (userData.department) updates.department = userData.department
          if (userData.designation) updates.designation = userData.designation
          if (userData.name) updates.name = userData.name
          if (userData.displayName) updates.displayName = userData.displayName || userData.name
          if (userData.username) updates.username = userData.username

          const linked = await Employee.findByIdAndUpdate(
            existingByEmail._id,
            { $set: updates, $inc: { authVersion: 1 } },
            { returnDocument: 'after', runValidators: true },
          ).select('+passwordHash').lean()

          clearUserCache(cleanEmail)
          if (cleanEmpId) clearUserCache(cleanEmpId)
          return toAuthUser(linked)
        }

        // 2. Ensure cleanEmpId is unique; if missing or taken by another employee, allocate next sequential ETS
        if (cleanEmpId) {
          const empWithCode = await Employee.findOne({ employeeId: cleanEmpId }).lean()
          if (empWithCode && empWithCode.email !== cleanEmail) {
            cleanEmpId = ''
          }
        }

        if (!cleanEmpId) {
          let maxCode = 21200
          const allCodes = await Employee.find({ employeeId: /^ETS\d+$/i }, 'employeeId').lean()
          for (const item of allCodes) {
            const m = String(item.employeeId || '').match(/^ETS(\d+)$/i)
            if (m) {
              const n = parseInt(m[1], 10)
              if (n >= maxCode) maxCode = n
            }
          }
          cleanEmpId = `ETS${maxCode + 1}`
        }

        const created = await Employee.create({
          employeeId: cleanEmpId,
          name: userData.name || cleanEmail.split('@')[0],
          displayName: userData.displayName || userData.name || cleanEmail.split('@')[0],
          username: userData.username || cleanEmail.split('@')[0],
          email: cleanEmail,
          passwordHash: userData.passwordHash,
          role: userData.role || 'employee',
          department: userData.department || 'General',
          designation: userData.designation || 'Staff Member',
          status: userData.status || 'active',
          employmentType: 'full_time',
          joiningDate: userData.joiningDate || new Date(),
        })
        clearUserCache(cleanEmail)
        if (cleanEmpId) clearUserCache(cleanEmpId)
        return toAuthUser(created.toObject())
      } catch (error) {
        if (error.code === 11000) {
          error.statusCode = 409
          error.code = 'USER_EXISTS'
          error.message = 'An account with this email or employee ID already exists.'
        }
        throw error
      }
    },
    async findByEmail(identifier) {
      await initialize()
      if (!identifier) return null
      const clean = String(identifier).trim()
      const cacheKey = `email:${clean.toLowerCase()}`
      const hit = userCache.get(cacheKey)
      if (hit && hit.expires > Date.now()) return hit.promise

      const promise = (async () => {
        const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`^${escaped}$`, 'i')

        const user = await Employee.findOne({
          $or: [
            { email: regex },
            { username: regex },
            { employeeId: regex },
            { name: regex },
            { displayName: regex },
          ],
        })
          .select('+passwordHash +authVersion')
          .lean()
        const authUser = toAuthUser(user)
        if (authUser && authUser.id) {
          userCache.set(`id:${authUser.id}`, { promise: Promise.resolve(authUser), expires: Date.now() + USER_TTL_MS })
        }
        return authUser
      })()

      userCache.set(cacheKey, { promise, expires: Date.now() + USER_TTL_MS })
      promise.catch(() => userCache.delete(cacheKey))
      if (userCache.size > 2000) {
        for (const [k, v] of userCache) if (v.expires < Date.now()) userCache.delete(k)
      }
      return promise
    },
    async findById(id) {
      await initialize()
      if (!id) return null
      const cacheKey = `id:${String(id).trim()}`
      const hit = userCache.get(cacheKey)
      if (hit && hit.expires > Date.now()) return hit.promise

      const promise = (async () => {
        let user = null
        if (mongoose.isValidObjectId(id)) {
          user = await Employee.findById(id).select('+passwordHash +authVersion').lean()
        }
        if (!user && typeof id === 'string') {
          const clean = id.trim()
          user = await Employee.findOne({
            $or: [
              { employeeId: clean.toUpperCase() },
              { id: clean },
              { email: clean.toLowerCase() },
              { username: clean.toLowerCase() },
            ],
          }).select('+passwordHash +authVersion').lean()
        }
        const authUser = toAuthUser(user)
        if (authUser?.email) {
          userCache.set(`email:${authUser.email.toLowerCase()}`, { promise: Promise.resolve(authUser), expires: Date.now() + USER_TTL_MS })
        }
        return authUser
      })()

      userCache.set(cacheKey, { promise, expires: Date.now() + USER_TTL_MS })
      promise.catch(() => userCache.delete(cacheKey))
      if (userCache.size > 2000) {
        for (const [k, v] of userCache) if (v.expires < Date.now()) userCache.delete(k)
      }
      return promise
    },
    async resetPassword(id, passwordHash) {
      await initialize()
      clearUserCache(id)
      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ employeeId: String(id).toUpperCase() }, { id: String(id) }, { email: String(id).toLowerCase() }] }
      const res = toAuthUser(await Employee.findOneAndUpdate(
        query,
        { $set: { passwordHash, mustChangePassword: true }, $inc: { authVersion: 1 } },
        { returnDocument: 'after', runValidators: true },
      ).lean())
      if (res?.email) clearUserCache(res.email)
      return res
    },
    async changePassword(id, passwordHash) {
      await initialize()
      clearUserCache(id)
      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ employeeId: String(id).toUpperCase() }, { id: String(id) }, { email: String(id).toLowerCase() }] }
      const res = toAuthUser(await Employee.findOneAndUpdate(
        query,
        { $set: { passwordHash, mustChangePassword: false }, $inc: { authVersion: 1 } },
        { returnDocument: 'after', runValidators: true },
      ).lean())
      if (res?.email) clearUserCache(res.email)
      return res
    },
    async updateUser(id, updates) {
      await initialize()
      clearUserCache(id)
      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ employeeId: String(id).toUpperCase() }, { email: String(id).toLowerCase() }] }
      const updated = await Employee.findOneAndUpdate(
        query,
        { $set: updates },
        { returnDocument: 'after', runValidators: true },
      ).lean()
      if (updated?.email) clearUserCache(updated.email)
      return toPublicUser(toAuthUser(updated))
    },
    async deleteUser(id) {
      await initialize()
      clearUserCache(id)
      const query = mongoose.isValidObjectId(id)
        ? { _id: id }
        : { $or: [{ employeeId: String(id).toUpperCase() }, { email: String(id).toLowerCase() }] }
      await Employee.deleteOne(query)
      return true
    },
    async getPublicById(id) {
      const user = await this.findById(id)
      return toPublicUser(user)
    },
    async isManagerOf(managerId, employeeId) {
      await initialize()
      if (!mongoose.isValidObjectId(managerId) || !mongoose.isValidObjectId(employeeId)) return false
      return Boolean(await Employee.exists({ _id: employeeId, managerId, status: 'active' }))
    },
  }
}
