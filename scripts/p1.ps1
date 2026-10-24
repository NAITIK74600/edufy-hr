import fs from 'node:fs';

const p1 = `import React, { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { hrStore, storeAction } from '../services/hrStore'
import { apiClient } from '../services/apiClient'
import { currentPayrollMonth } from '../services/connectedStore'
import { Button, EmptyState, Field, PageHeader, StatusBadge } from '../components/ui'
import { numberToWordsINR } from '../utils/numberToWords'
import { PayslipPreviewModal } from '../components/payroll/PayslipPreviewModal'
import { CompanySettingsModal } from '../components/payroll/CompanySettingsModal'
import { BulkGenerateModal } from '../components/payroll/BulkGenerateModal'

const earningsKeys = ['basic', 'hra', 'specialAllowance', 'conveyance', 'medicalAllowance', 'performanceBonus', 'overtime']
const deductionKeys = ['pf', 'esi', 'professionalTax', 'tdsTax', 'loanAdvance', 'lossOfPay', 'performanceDeduction', 'otherDeductions']
const total = (amounts) => Object.values(amounts ?? {}).reduce((sum, amount) => sum + amount, 0)
const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0)
const label = (key) => key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())

const DEFAULT_EARNINGS_LIST = [
  { name: 'BASIC', monthlyRate: 16265, currentMonth: 16265, arrear: 0, total: 16265 },
  { name: 'HOUSE RENT ALLOWANCE (HRA)', monthlyRate: 9759, currentMonth: 9759, arrear: 0, total: 9759 },
  { name: 'CONVEYANCE ALLOWANCE', monthlyRate: 1600, currentMonth: 1600, arrear: 0, total: 1600 },
  { name: 'OTHER ALLOWANCE', monthlyRate: 2500, currentMonth: 2500, arrear: 0, total: 2500 },
  { name: 'SPECIAL ALLOWANCE', monthlyRate: 3775, currentMonth: 3775, arrear: 0, total: 3775 },
]

const DEFAULT_DEDUCTIONS_LIST = [
  { name: 'P.F.', amount: 1952 },
  { name: 'PROFESSIONAL TAX', amount: 200 },
]
`;
fs.writeFileSync('E:/hr dashbord/scripts/gen-payroll.mjs', p1, 'utf8');
