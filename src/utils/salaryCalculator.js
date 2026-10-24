/**
 * Standard Salary Structure Calculator & Synchronizer
 * Handles Basic Pay, HRA, CA (Conveyance), SA (Special Allowance), OA (Other Allowance)
 */

export function calculateComponentsFromCTC(annualCTC) {
  const annual = Math.max(0, Number(annualCTC) || 0)
  const monthlyGross = Math.round(annual / 12)

  if (monthlyGross === 0) {
    return {
      basic: 0,
      hra: 0,
      ca: 0,
      conveyance: 0,
      sa: 0,
      specialAllowance: 0,
      oa: 0,
      otherAllowance: 0,
      monthlyGross: 0,
      annualCTC: 0,
    }
  }

  // Standard Indian Payroll Structure:
  // - Basic: 50% of monthly gross
  // - HRA: 40% of basic (= 20% of monthly gross)
  // - Conveyance (CA): ₹1,600 (or up to 10% for lower salaries)
  // - Special Allowance (SA): 15% of monthly gross
  // - Other Allowance (OA): Balancing amount
  const basic = Math.round(monthlyGross * 0.5)
  const hra = Math.round(basic * 0.4)
  const conveyance = monthlyGross > 8000 ? 1600 : Math.round(monthlyGross * 0.1)
  const specialAllowance = Math.round(monthlyGross * 0.15)
  const otherAllowance = Math.max(0, monthlyGross - basic - hra - conveyance - specialAllowance)

  return {
    basic,
    hra,
    ca: conveyance,
    conveyance,
    sa: specialAllowance,
    specialAllowance,
    oa: otherAllowance,
    otherAllowance,
    monthlyGross,
    annualCTC: monthlyGross * 12,
  }
}

export function calculateCTCFromComponents(structure = {}) {
  const basic = Math.max(0, Number(structure.basic) || 0)
  const hra = Math.max(0, Number(structure.hra) || 0)
  const conveyance = Math.max(0, Number(structure.conveyance ?? structure.ca) || 0)
  const specialAllowance = Math.max(0, Number(structure.specialAllowance ?? structure.sa) || 0)
  const otherAllowance = Math.max(0, Number(structure.otherAllowance ?? structure.oa) || 0)

  const monthlyGross = basic + hra + conveyance + specialAllowance + otherAllowance
  const annualCTC = monthlyGross * 12

  return {
    basic,
    hra,
    ca: conveyance,
    conveyance,
    sa: specialAllowance,
    specialAllowance,
    oa: otherAllowance,
    otherAllowance,
    monthlyGross,
    annualCTC,
  }
}

export function normalizeSalaryStructure(emp) {
  if (!emp) return calculateComponentsFromCTC(0)

  const existingStruct = emp.salaryStructure || {}
  const hasCustomComponents = (
    existingStruct.basic !== undefined ||
    existingStruct.hra !== undefined ||
    existingStruct.ca !== undefined ||
    existingStruct.conveyance !== undefined ||
    existingStruct.sa !== undefined ||
    existingStruct.specialAllowance !== undefined ||
    existingStruct.oa !== undefined ||
    existingStruct.otherAllowance !== undefined
  )

  if (hasCustomComponents) {
    return calculateCTCFromComponents(existingStruct)
  }

  const annual = Number(emp.salary || emp.baseSalary || 0)
  return calculateComponentsFromCTC(annual)
}
