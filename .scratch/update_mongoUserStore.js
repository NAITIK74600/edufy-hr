import fs from 'node:fs'

let content = fs.readFileSync('server/src/auth/mongoUserStore.js', 'utf8')

const target1 = `      for (const { id, ...user } of managementUsers) {
        const existing = await Employee.findOne({ $or: [{ email: user.email }, { employeeId: user.employeeId }] }).lean()
        if (existing && existing.role !== user.role && existing.employeeId !== user.employeeId) {
          throw Object.assign(new Error(\`Configured \${user.role} email conflicts with an existing employee. Resolve the duplicate before starting.\`), { statusCode: 409, code: 'MANAGEMENT_ACCOUNT_CONFLICT' })
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
      }`

const repl1 = `      for (const { id, ...user } of managementUsers) {
        const existing = await Employee.findOne({
          $or: [
            { email: user.email.toLowerCase().trim() },
            { employeeId: user.employeeId.toUpperCase().trim() },
            ...(user.role === 'managing_director' ? [{ employeeId: 'EDU-DIR-001' }, { username: 'jagadishbabu' }, { name: /jagadish\\s*babu/i }] : []),
          ],
        }).lean()
        const { passwordHash, permissions, role, username, status, ...profile } = user
        if (existing) {
          const updateFields = { email: user.email, permissions, role, username, status: 'active' }
          if (!existing.passwordHash) {
            updateFields.passwordHash = passwordHash
          }
          await Employee.updateOne(
            { _id: existing._id },
            { $set: updateFields }
          )
        } else {
          await Employee.findOneAndUpdate(
            { email: user.email },
            { $set: { passwordHash, permissions, role, username, status: 'active' }, $setOnInsert: { ...profile, joiningDate: new Date() } },
            { upsert: true, returnDocument: 'after', runValidators: true },
          )
        }
      }`

const targetNormalized = target1.replace(/\r\n/g, '\n')
const contentNormalized = content.replace(/\r\n/g, '\n')

if (contentNormalized.includes(targetNormalized)) {
  let updated = contentNormalized.replace(targetNormalized, repl1.replace(/\r\n/g, '\n'))
  // Also update line 79
  updated = updated.replace(
    "{ role: { $in: ['admin', 'director', 'hr', 'manager', 'team_lead', 'employee'] } }",
    "{ role: { $in: ['admin', 'director', 'managing_director', 'co_founder', 'vertical_head', 'hr', 'manager', 'team_lead', 'employee'] } }"
  )
  if (content.includes('\r\n')) {
    updated = updated.replace(/\n/g, '\r\n')
  }
  fs.writeFileSync('server/src/auth/mongoUserStore.js', updated, 'utf8')
  console.log('Successfully updated server/src/auth/mongoUserStore.js')
} else {
  console.log('Target not found in mongoUserStore.js')
}

