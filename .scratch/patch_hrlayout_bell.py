import re

path = 'src/components/HRLayout.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update handleClickOutside to handle .topbar-profile-dropdown and .notif-popover
old_click = """      const clickedProfile = profileRef.current && (profileRef.current.contains(event.target) || path.includes(profileRef.current))
      const clickedNotif = notifRef.current && (notifRef.current.contains(event.target) || path.includes(notifRef.current))"""

new_click = """      const clickedProfile = profileRef.current && (profileRef.current.contains(event.target) || path.includes(profileRef.current) || Boolean(event.target?.closest?.('.topbar-profile-dropdown')))
      const clickedNotif = notifRef.current && (notifRef.current.contains(event.target) || path.includes(notifRef.current) || Boolean(event.target?.closest?.('.notif-popover')))"""

assert old_click.replace('\r\n', '\n') in content.replace('\r\n', '\n'), "old_click not found"
content = content.replace(old_click.replace('\r\n', '\n'), new_click.replace('\r\n', '\n'))
content = content.replace(old_click, new_click)

# 2. Update syncUnifiedNotifications to preserve locallyReadIds
old_sync = """        setNotifications(normalized)
        const unread = normalized.filter((n) => !n.read && !n.readAt)"""

new_sync = """        setNotifications((prev) => {
          const locallyReadIds = new Set(
            prev.filter((n) => n.read || n.readAt).map((n) => String(n.id || n._id))
          )
          return normalized.map((n) => {
            const isRead = Boolean(n.read || n.readAt || locallyReadIds.has(String(n.id)))
            return {
              ...n,
              read: isRead,
              readAt: n.readAt || (isRead ? (n.readAt || new Date().toISOString()) : null),
            }
          })
        })
        const unread = normalized.filter((n) => !n.read && !n.readAt)"""

assert old_sync.replace('\r\n', '\n') in content.replace('\r\n', '\n'), "old_sync not found"
content = content.replace(old_sync.replace('\r\n', '\n'), new_sync.replace('\r\n', '\n'))
content = content.replace(old_sync, new_sync)

# 3. Update unsubscribeStore to preserve read status on merge
old_sub = """          fresh.forEach((item) => {
            const id = String(item.id || item._id || '')
            if (id) {
              const prevItem = map.get(id)
              map.set(id, { ...prevItem, ...item, id, _id: id })
            }
          })"""

new_sub = """          fresh.forEach((item) => {
            const id = String(item.id || item._id || '')
            if (id) {
              const prevItem = map.get(id)
              const isRead = Boolean(prevItem?.read || prevItem?.readAt || item.read || item.readAt)
              const readAt = prevItem?.readAt || item.readAt || (isRead ? (prevItem?.readAt || item.readAt || new Date().toISOString()) : null)
              map.set(id, {
                ...item,
                ...prevItem,
                id,
                _id: id,
                read: isRead,
                readAt,
              })
            }
          })"""

assert old_sub.replace('\r\n', '\n') in content.replace('\r\n', '\n'), "old_sub not found"
content = content.replace(old_sub.replace('\r\n', '\n'), new_sub.replace('\r\n', '\n'))
content = content.replace(old_sub, new_sub)

# 4. Update unreadCount definition
old_unread = """  const unreadCount = notifications.filter((n) => !n.read).length"""
new_unread = """  const unreadCount = notifications.filter((n) => !n.read && !n.readAt).length"""

assert old_unread.replace('\r\n', '\n') in content.replace('\r\n', '\n'), "old_unread not found"
content = content.replace(old_unread.replace('\r\n', '\n'), new_unread.replace('\r\n', '\n'))
content = content.replace(old_unread, new_unread)

# 5. Update badge display to cap at 99+
old_badge = """{unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}"""
new_badge = """{unreadCount > 0 && <span className="badge-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}"""

assert old_badge.replace('\r\n', '\n') in content.replace('\r\n', '\n'), "old_badge not found"
content = content.replace(old_badge.replace('\r\n', '\n'), new_badge.replace('\r\n', '\n'))
content = content.replace(old_badge, new_badge)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("[SUCCESS] Patched HRLayout.jsx successfully!")
