const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI || 'mongodb://admin_edufytech:Q2j6fPfiaa@127.0.0.1:27017/admin_edufytech_employee_portal?authSource=admin';

async function auditDatabase() {
  console.log('--- AUDITING DATABASE COLLECTIONS & SCHEMAS ---');
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log('Collections count:', collections.length);
  const colStats = {};
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    colStats[col.name] = count;
  }
  console.log('Collection counts:', JSON.stringify(colStats, null, 2));

  // Employee checks
  const employeesCol = db.collection('employees');
  const totalEmployees = await employeesCol.countDocuments();
  const activeEmployees = await employeesCol.countDocuments({ status: 'active' });
  const missingManager = await employeesCol.countDocuments({
    managerId: null,
    role: { $nin: ['admin', 'director', 'managing_director'] }
  });
  const unassignedDesignation = await employeesCol.countDocuments({
    $or: [
      { designation: null },
      { designation: '' },
      { designation: { $exists: false } },
      { designation: 'Employee' }
    ]
  });

  console.log({
    totalEmployees,
    activeEmployees,
    employeesMissingManagerExcludingLeadership: missingManager,
    unassignedDesignationCount: unassignedDesignation
  });

  // Check unique roles in DB
  const roles = await employeesCol.distinct('role');
  console.log('Distinct roles in employees collection:', roles);

  // Check unique departments in DB
  const departments = await employeesCol.distinct('department');
  console.log('Distinct departments in employees collection:', departments);

  // Check unique designations in DB
  const designations = await employeesCol.distinct('designation');
  console.log('Distinct designations in employees collection:', designations);

  // Check reporting manager reference integrity
  const allEmployees = await employeesCol.find({}, { projection: { _id: 1, employeeId: 1, name: 1, role: 1, managerId: 1 } }).toArray();
  const empIdSet = new Set(allEmployees.map(e => String(e._id)));
  let brokenManagerLinks = 0;
  for (const emp of allEmployees) {
    if (emp.managerId) {
      const mgrStr = String(emp.managerId);
      if (!empIdSet.has(mgrStr)) {
        console.log(`BROKEN MANAGER LINK: ${emp.employeeId} (${emp.name}) points to non-existent managerId ${mgrStr}`);
        brokenManagerLinks++;
      }
    }
  }
  console.log('Broken manager links count:', brokenManagerLinks);

  // Check leave collection
  if (colStats['leaverequests']) {
    const leaveCol = db.collection('leaverequests');
    const sampleLeaves = await leaveCol.find({}).limit(5).toArray();
    console.log('Sample leaves count:', sampleLeaves.length);
  }

  // Check notifications collection
  if (colStats['notifications']) {
    const notifCol = db.collection('notifications');
    const sampleNotifs = await notifCol.find({}).sort({ createdAt: -1 }).limit(5).toArray();
    console.log('Sample recent notifications:', sampleNotifs.map(n => ({
      recipientRole: n.recipientRole,
      recipientId: n.recipientId,
      employeeId: n.employeeId,
      type: n.type,
      title: n.title,
      read: n.read
    })));
  }

  await mongoose.disconnect();
}

auditDatabase().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});

