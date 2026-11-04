with open('src/services/connectedStore.js', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8', errors='ignore')
text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')

# 1. Update normalizeLeave managerId
old_normalize_mgr = "    managerId: request.managerId?.employeeId ?? request.managerId,"
new_normalize_mgr = """    managerId: request.managerId?._id ? String(request.managerId._id) : (request.managerId?.employeeId ?? (typeof request.managerId === 'string' ? request.managerId : (request.managerId ? String(request.managerId) : null))),"""

assert old_normalize_mgr in text, "old_normalize_mgr not found in connectedStore.js"
text = text.replace(old_normalize_mgr, new_normalize_mgr, 1)

# 2. Add leavePolicies to requests
old_requests = """        teamLeaves: !management && can('leave.team.read') ? apiClient.get('/leave/team') : Promise.resolve({ data: [] }),
        config: apiClient.get('/attendance/config'),"""

new_requests = """        teamLeaves: !management && can('leave.team.read') ? apiClient.get('/leave/team') : Promise.resolve({ data: [] }),
        leavePolicies: apiClient.get('/leave/policies').catch(() => ({ data: [] })),
        config: apiClient.get('/attendance/config'),"""

assert old_requests in text, "old_requests not found in connectedStore.js"
text = text.replace(old_requests, new_requests, 1)

# 3. Assign leavePolicies to state
old_assign = """        leaves: [...new Map([...data.leaves, ...data.teamLeaves].map((request) => [request.id ?? request._id, request])).values()].map((request) => normalizeLeave(request, employees)),"""

new_assign = """        leaves: [...new Map([...data.leaves, ...data.teamLeaves].map((request) => [request.id ?? request._id, request])).values()].map((request) => normalizeLeave(request, employees)),
        leavePolicies: Array.isArray(data.leavePolicies?.data) ? data.leavePolicies.data : (Array.isArray(data.leavePolicies) ? data.leavePolicies : []),"""

assert old_assign in text, "old_assign not found in connectedStore.js"
text = text.replace(old_assign, new_assign, 1)

output = text.replace('\n', '\r\n')
with open('src/services/connectedStore.js', 'wb') as f:
    f.write(output.encode('utf-8'))

print("Successfully updated src/services/connectedStore.js")
