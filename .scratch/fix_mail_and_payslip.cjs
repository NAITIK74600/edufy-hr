const fs = require('fs');
const path = require('path');

// 1. mail.service.js
const mailPath = path.resolve('server/src/services/mail.service.js');
let mailContent = fs.readFileSync(mailPath, 'utf8');

mailContent = mailContent.replace(
  "const designation = employee.designation || 'Staff Associate'",
  "const designation = employee.designation || 'Pending Designation'"
);
mailContent = mailContent.replace(
  "const designation = employee?.designation || 'Team Member'",
  "const designation = employee?.designation || 'Pending Designation'"
);
mailContent = mailContent.replace(
  "const designation = employee?.designation || 'Team Member'",
  "const designation = employee?.designation || 'Pending Designation'"
);

fs.writeFileSync(mailPath, mailContent, 'utf8');
console.log('Successfully updated mail.service.js');

// 2. payslip.service.js
const payslipPath = path.resolve('server/src/services/payslip.service.js');
if (fs.existsSync(payslipPath)) {
  let payslipContent = fs.readFileSync(payslipPath, 'utf8');
  payslipContent = payslipContent.replace(
    "const designation = emp.designation || 'Associate'",
    "const designation = emp.designation || 'Pending Designation'"
  );
  fs.writeFileSync(payslipPath, payslipContent, 'utf8');
  console.log('Successfully updated payslip.service.js');
}

