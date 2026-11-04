with open('src/services/connectedStore.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\r\n', '\n')

old_code = """          const res = await apiClient.post('/leave/requests', {
            leaveType: data.leaveType || 'casual',
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason || 'Leave application',
            replaceOverlap: Boolean(data.replaceOverlap),
          })
          if (rawLocal.applyLeave) rawLocal.applyLeave(data, activeUser)
          if (res?.data) {
            const newRecord = normalizeLeave(res.data)
            state().leaves = [newRecord, ...(state().leaves || []).filter((l) => l.id !== newRecord.id)]
          }"""

new_code = """          const res = await apiClient.post('/leave/requests', {
            leaveType: data.leaveType || 'casual',
            startDate: data.startDate,
            endDate: data.endDate,
            reason: data.reason || 'Leave application',
            replaceOverlap: Boolean(data.replaceOverlap),
          })
          if (res?.data) {
            const newRecord = normalizeLeave(res.data)
            state().leaves = [newRecord, ...(state().leaves || []).filter((l) => l.id !== newRecord.id && l._id !== newRecord._id)]
          } else if (rawLocal.applyLeave) {
            rawLocal.applyLeave(data, activeUser)
          }"""

assert old_code in content, "old_code not found in connectedStore.js"
content = content.replace(old_code, new_code, 1)

with open('src/services/connectedStore.js', 'w', encoding='utf-8') as f:
    f.write(content.replace('\n', '\r\n'))

print("[SUCCESS] src/services/connectedStore.js updated!")

