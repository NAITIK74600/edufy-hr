const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/pages/LeavePolicySettings.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "designation: emp.designation || emp.role || 'Team Member',",
  "designation: emp.designation || 'Pending Designation',"
);

content = content.replace(
  "designation: empObj.designation || empObj.role || 'Team Member',",
  "designation: empObj.designation || 'Pending Designation',"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated LeavePolicySettings.jsx');

