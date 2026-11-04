import fs from 'fs';

const data = JSON.parse(fs.readFileSync('.scratch/mongodb_pre_wipe_backup.json', 'utf8'));
console.log('leaverequests in backup:', JSON.stringify(data.leaverequests, null, 2));

const naitik = data.employees.find(e => e.name && e.name.toLowerCase().includes('naitik'));
console.log('Naitik in backup:', JSON.stringify(naitik, null, 2));

const ets110328 = data.employees.find(e => e.employeeId === 'ETS110328');
console.log('ETS110328 in backup:', JSON.stringify(ets110328, null, 2));
