const fs = require('fs');
let code = fs.readFileSync('src/components/WorkspaceRecords.jsx', 'utf8');

// 1. Add apiClient import
if (!code.includes("import { apiClient }")) {
  code = code.replace(
    "import { hrStore } from '../services/hrStore'",
    "import { hrStore } from '../services/hrStore'\nimport { apiClient } from '../services/apiClient'"
  );
}

// 2. Update mark all read and clear all
const oldMarkClear = `          <Button
            variant="secondary"
            onClick={action(() => {
              hrStore.markAllNotificationsRead()
              showNotice('All notifications marked as read.')
            })}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 size={14} /> Mark all read
          </Button>
          <Button
            variant="danger"
            onClick={action(() => {
              if (window.confirm('Are you sure you want to clear all notifications?')) {
                hrStore.clearAllNotifications()
                showNotice('All notifications cleared.')
              }
            })}
            disabled={notifications.length === 0}
          >
            <Trash2 size={14} /> Clear All
          </Button>`;

const newMarkClear = `          <Button
            variant="secondary"
            onClick={action(async () => {
              try { await apiClient.patch('/notifications/read-all', {}) } catch {}
              hrStore.markAllNotificationsRead()
              showNotice('All notifications marked as read.')
            })}
            disabled={unreadCount === 0}
          >
            <CheckCircle2 size={14} /> Mark all read
          </Button>
          <Button
            variant="danger"
            onClick={action(async () => {
              if (window.confirm('Are you sure you want to clear all notifications?')) {
                try { await apiClient.delete('/notifications/clear-all') } catch {}
                hrStore.clearAllNotifications()
                showNotice('All notifications cleared.')
              }
            })}
            disabled={notifications.length === 0}
          >
            <Trash2 size={14} /> Clear All
          </Button>`;

const normCode = code.replace(/\r\n/g, '\n');
const normOld = oldMarkClear.replace(/\r\n/g, '\n');

if (normCode.includes(normOld)) {
  let updated = normCode.replace(normOld, newMarkClear);
  fs.writeFileSync('src/components/WorkspaceRecords.jsx', updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated WorkspaceRecords.jsx');
} else {
  console.error('Target not found in WorkspaceRecords.jsx');
}

