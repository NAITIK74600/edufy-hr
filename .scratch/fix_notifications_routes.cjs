const fs = require('fs');
const path = require('path');

const filePath = path.resolve('server/src/modules/notifications/notification.routes.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Leadership and admin role matching in GET /
const oldRoleMatches = `      if (isLeadership) {
        userMatches.push(
          { recipientRole: 'management' },
          { recipientRole: 'leadership' },
          { recipientRole: 'all' },
          { recipientRole: user.role }
        )
      }`;

const newRoleMatches = `      if (isLeadership) {
        userMatches.push(
          { recipientRole: 'management' },
          { recipientRole: 'leadership' },
          { recipientRole: 'all' },
          { recipientRole: user.role },
          ...(userRole === 'managing_director' || userRole === 'director' ? [{ recipientRole: 'director' }, { recipientRole: 'managing_director' }] : []),
          ...(userRole === 'admin' ? [{ recipientRole: 'hr' }, { recipientRole: 'director' }] : [])
        )
      }`;

content = content.replace(oldRoleMatches, newRoleMatches);

// 2. Safe title and message fallback
content = content.replace(
  `          title: item.title,
          message: item.message,`,
  `          title: item.title || item.event || 'Notification',
          message: item.message || '',`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated notification.routes.js');

