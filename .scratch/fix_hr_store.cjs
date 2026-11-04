const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/services/hrStore.js');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  "designation: userData.designation || 'Specialist',",
  "designation: userData.designation || 'Pending Designation',"
);

content = content.replace(
  "designation: updates.designation || existing?.designation || 'Specialist',",
  "designation: updates.designation || existing?.designation || 'Pending Designation',"
);

content = content.replace(
  "designation: empData.designation || 'Specialist',",
  "designation: empData.designation || 'Pending Designation',"
);

content = content.replace(
  "designation: emp.designation || 'Specialist',",
  "designation: emp.designation || 'Pending Designation',"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated hrStore.js');

