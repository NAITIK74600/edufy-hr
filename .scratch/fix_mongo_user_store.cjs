const fs = require('fs');
const path = require('path');

const filePath = path.resolve('server/src/auth/mongoUserStore.js');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "user.email.split('@')[0] : 'Employee')",
  "user.email.split('@')[0] : 'Team Member')"
);
content = content.replace(
  "source.email.split('@')[0] : 'Employee')",
  "source.email.split('@')[0] : 'Team Member')"
);
content = content.replace(
  "designation: userData.designation || 'Staff Member',",
  "designation: (userData.designation && String(userData.designation).trim()) || 'Pending Designation',"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated mongoUserStore.js');

