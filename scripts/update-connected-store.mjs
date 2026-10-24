import fs from 'node:fs';

let content = fs.readFileSync('E:/hr dashbord/src/services/connectedStore.js', 'utf8');

// 1. Add payrollSettings to requests
if (!content.includes('payrollSettings:')) {
  content = content.replace(
    "config: apiClient.get('/attendance/config'),",
    "config: apiClient.get('/attendance/config'),\n        payrollSettings: apiClient.get('/payroll/settings').catch(() => ({ data: {} })),"
  );
}

// 2. Enhance payroll mapping and companySettings
content = content.replace(
  /payroll:\s*data\.payroll\.map\([\s\S]*?companySettings:\s*\{\s*\.\.\.state\(\)\.companySettings,\s*\.\.\.data\.config\s*\},/,
  `payroll: (data.payroll || []).map((record) => {
          const gross = record.grossEarnings || Object.values(record.earnings ?? {}).reduce((sum, value) => sum + value, 0)
          const totalDeductions = record.totalDeductions || Object.values(record.deductions ?? {}).reduce((sum, value) => sum + value, 0)
          return { ...record, gross, totalDeductions, net: record.netPay ?? (gross - totalDeductions) }
        }), leaveBalances: data.balances, dataErrors,
        dataError: Object.entries(dataErrors).map(([key, message]) => \`\${key}: \${message}\`).join(' · '), dataReady: true,
        companySettings: { ...state().companySettings, ...data.config, ...(data.payrollSettings || {}) },`
);

// 3. Add methods before last closing brace
if (!content.includes('savePayrollRecord(record)')) {
  const lastBraceIndex = content.lastIndexOf('  }');
  if (lastBraceIndex !== -1) {
    const methods = `    savePayrollRecord(record) {
      if (!user && rawLocal.savePayrollRecord) return rawLocal.savePayrollRecord(record)
      return mutate(() => apiClient.post('/payroll', record))
    },
    executePayrollRun(month) {
      if (!user && rawLocal.executePayrollRun) return rawLocal.executePayrollRun(month)
      return mutate(() => apiClient.post('/payroll/finalize', { month }))
    },
    bulkGeneratePayroll(payload) {
      if (!user && rawLocal.bulkGeneratePayroll) return rawLocal.bulkGeneratePayroll(payload)
      return mutate(() => apiClient.post('/payroll/bulk-generate', payload))
    },
    updateCompanySettings(updates) {
      if (!user && rawLocal.updateCompanySettings) return rawLocal.updateCompanySettings(updates)
      if (!user) {
        state().companySettings = { ...state().companySettings, ...updates }
        notify()
        return true
      }
      return mutate(() => apiClient.patch('/payroll/settings', updates))
    },
    emailPayslip(id) {
      if (!user) return { success: true, message: 'Simulated email sent' }
      return mutate(() => apiClient.post(\`/payroll/\${id}/email\`))
    },
`;
    content = content.slice(0, lastBraceIndex) + methods + content.slice(lastBraceIndex);
  }
}

fs.writeFileSync('E:/hr dashbord/src/services/connectedStore.js', content, 'utf8');
console.log('Successfully updated connectedStore.js');
