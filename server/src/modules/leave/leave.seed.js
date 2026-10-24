import { LeavePolicy } from '../../models/LeavePolicy.js'

// Baseline policies so employees can apply for leave on a fresh database.
// Inserted only when missing ($setOnInsert) — HR edits are never overwritten.
export const DEFAULT_LEAVE_POLICIES = Object.freeze([
  { leaveType: 'casual', label: 'Casual Leave (CL)', annualAllowance: 12, approvalStage: 'manager_hr' },
  { leaveType: 'sick', label: 'Sick / Medical Leave (SL)', annualAllowance: 10, approvalStage: 'manager_hr' },
  { leaveType: 'earned', label: 'Earned / Privilege Leave (EL)', annualAllowance: 15, approvalStage: 'manager_hr', carryForward: true },
  { leaveType: 'comp_off', label: 'Compensatory Off', annualAllowance: 5, approvalStage: 'manager_hr' },
  { leaveType: 'maternity', label: 'Maternity / Paternity Leave', annualAllowance: 182, approvalStage: 'hr', countWeekends: true },
  { leaveType: 'lop', label: 'Loss of Pay (LOP) / Unpaid', annualAllowance: 365, approvalStage: 'manager_hr' },
])

export async function seedLeavePolicies() {
  if (DEFAULT_LEAVE_POLICIES.length === 0) return
  await LeavePolicy.bulkWrite(DEFAULT_LEAVE_POLICIES.map((policy) => ({
    updateOne: {
      filter: { leaveType: policy.leaveType },
      update: { $setOnInsert: { configured: true, requiresReason: true, ...policy } },
      upsert: true,
    },
  })))
}
