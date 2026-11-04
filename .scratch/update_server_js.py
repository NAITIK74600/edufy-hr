with open('server/src/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = '  if (useDatabase) warmOnboardingDocsCache().catch((error) => logStartup(`Onboarding docs cache warm-up failed: ${error.message}`))'

replacement = '''  if (useDatabase) {
    warmOnboardingDocsCache().catch((error) => logStartup(`Onboarding docs cache warm-up failed: ${error.message}`))
    import('./modules/leave/leave.repository.js').then(({ mongoLeaveRepository }) => {
      const repo = mongoLeaveRepository()
      if (repo?.reconcileMonthlyBalances) {
        repo.reconcileMonthlyBalances()
          .then((res) => logStartup(`✨ Monthly leave balances reconciled: ${JSON.stringify(res)}`))
          .catch((err) => logStartup(`Leave reconciliation notice: ${err.message}`))
        // Run hourly background renewal
        setInterval(() => {
          repo.reconcileMonthlyBalances().catch(() => {})
        }, 1000 * 60 * 60)
      }
    }).catch(() => {})
  }'''

assert target in content, 'target in server.js not found'
content = content.replace(target, replacement, 1)

with open('server/src/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated server.js successfully')

