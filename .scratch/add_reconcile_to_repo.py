with open('server/src/modules/leave/leave.repository.js', 'r', encoding='utf-8') as f:
    content = f.read()

reconcile_method = '''    async reconcileMonthlyBalances() {
      ensureConnected()
      const currentMonthKey = new Date().toISOString().slice(0, 7)
      let reconciledCount = 0
      let createdCount = 0

      try {
        const allEmps = await Employee.find({ status: { $ne: 'terminated' } })
          .select('_id employeeId name department employmentType designation role')
          .lean()

        const balances = await LeaveBalance.find().lean()
        const balancesByEmp = new Map()

        for (const b of balances) {
          const empId = String(b.employeeId)
          if (!balancesByEmp.has(empId)) balancesByEmp.set(empId, [])
          balancesByEmp.get(empId).push(b)
        }

        for (const emp of allEmps) {
          const empIdStr = String(emp._id)
          const empType = String(emp.employmentType || '').toLowerCase().replace(/[-\\s]/g, '_')
          const isIntern = empType === 'intern' || String(emp.designation || '').toLowerCase().includes('intern') || String(emp.role || '').toLowerCase().includes('intern')
          const expectedCasual = isIntern ? 0 : 1
          const expectedSick = 1

          const empBalances = balancesByEmp.get(empIdStr) || []
          const casualRec = empBalances.find((b) => b.leaveType === 'casual')
          const sickRec = empBalances.find((b) => b.leaveType === 'sick')

          if (!casualRec) {
            await LeaveBalance.create({
              employeeId: emp._id,
              leaveType: 'casual',
              allowance: expectedCasual,
              used: 0,
              reserved: 0,
              month: currentMonthKey,
              updatedAt: new Date(),
            })
            createdCount++
          } else if (!casualRec.month || casualRec.month !== currentMonthKey) {
            await LeaveBalance.updateOne(
              { _id: casualRec._id },
              { $set: { allowance: expectedCasual, used: 0, reserved: 0, month: currentMonthKey, updatedAt: new Date() } }
            )
            reconciledCount++
          }

          if (!sickRec) {
            await LeaveBalance.create({
              employeeId: emp._id,
              leaveType: 'sick',
              allowance: expectedSick,
              used: 0,
              reserved: 0,
              month: currentMonthKey,
              updatedAt: new Date(),
            })
            createdCount++
          } else if (!sickRec.month || sickRec.month !== currentMonthKey) {
            await LeaveBalance.updateOne(
              { _id: sickRec._id },
              { $set: { allowance: expectedSick, used: 0, reserved: 0, month: currentMonthKey, updatedAt: new Date() } }
            )
            reconciledCount++
          }
        }
      } catch (err) {
        console.warn('[leave.repository] reconcileMonthlyBalances warning:', err.message)
      }

      return { reconciledCount, createdCount }
    },
'''

assert 'async listBalances(filters = {}) {' in content, 'listBalances not found'
content = content.replace('async listBalances(filters = {}) {', reconcile_method + '\n    async listBalances(filters = {}) {')

with open('server/src/modules/leave/leave.repository.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Added reconcileMonthlyBalances to leave.repository.js successfully')

