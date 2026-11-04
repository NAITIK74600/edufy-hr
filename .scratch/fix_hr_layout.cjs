const fs = require('fs');
const path = require('path');

const filePath = path.resolve('src/components/HRLayout.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the hardcoded profile details
const oldProfileRows = `                      <div className="profile-detail-row">
                        <span>Employee ID</span>
                        <strong>{user?.employeeId || 'EDU-EMP-001'}</strong>
                      </div>
                      <div className="profile-detail-row">
                        <span>Department</span>
                        <strong>{user?.department || 'People Operations'}</strong>
                      </div>
                      <div className="profile-detail-row">
                        <span>Designation</span>
                        <strong>{user?.designation || 'Head of People Operations'}</strong>
                      </div>`;

const newProfileRows = `                      {(() => {
                        const activeEmpProfile = (storeState?.employees || []).find((e) =>
                          (user?.id && (e.id === user.id || e._id === user.id)) ||
                          (user?.employeeId && e.employeeId === user.employeeId) ||
                          (user?.email && e.email?.toLowerCase() === user.email.toLowerCase())
                        ) || user
                        return (
                          <>
                            <div className="profile-detail-row">
                              <span>Employee ID</span>
                              <strong>{activeEmpProfile?.employeeId || user?.employeeId || '—'}</strong>
                            </div>
                            <div className="profile-detail-row">
                              <span>Department</span>
                              <strong>{activeEmpProfile?.department || user?.department || 'General'}</strong>
                            </div>
                            <div className="profile-detail-row">
                              <span>Designation</span>
                              <strong>{activeEmpProfile?.designation || user?.designation || 'Pending Designation'}</strong>
                            </div>
                          </>
                        )
                      })()}`;

content = content.replace(oldProfileRows, newProfileRows);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HRLayout.jsx');

