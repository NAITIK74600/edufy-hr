const fs = require('fs');
let code = fs.readFileSync('src/components/HRLayout.jsx', 'utf8');

// 1. Fix handleClickOutside
const oldClick = `    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false)
      }
    }`;

const newClick = `    function handleClickOutside(event) {
      const path = event.composedPath ? event.composedPath() : []
      const clickedProfile = profileRef.current && (profileRef.current.contains(event.target) || path.includes(profileRef.current))
      const clickedNotif = notifRef.current && (notifRef.current.contains(event.target) || path.includes(notifRef.current))

      if (!clickedProfile) setProfileOpen(false)
      if (!clickedNotif) setNotifOpen(false)
    }`;

// 2. Add handleDeleteOne
const oldMarkOne = `  const handleMarkOneRead = async (item) => {
    const id = item.id || item._id
    try {
      await apiClient.patch(\`/notifications/\${id}/read\`, {})
    } catch {}
    setNotifications((prev) => prev.map((n) => ((n.id === id || n._id === id) ? { ...n, read: true } : n)))
    hrStore.markNotificationRead(id)
  }`;

const newMarkAndDel = `  const handleMarkOneRead = async (item) => {
    const id = item.id || item._id
    setNotifications((prev) => prev.map((n) => ((n.id === id || n._id === id) ? { ...n, read: true } : n)))
    try {
      await apiClient.patch(\`/notifications/\${id}/read\`, {})
    } catch {}
    hrStore.markNotificationRead(id)
  }

  const handleDeleteOne = async (item) => {
    const id = item.id || item._id
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id))
    try {
      await apiClient.delete(\`/notifications/\${id}\`)
    } catch {}
    if (hrStore.deleteNotification) {
      hrStore.deleteNotification(id)
    }
  }`;

// 3. Add SSE stream effect
const sseBlock = `  // Real-time live notification stream (SSE) with automatic fallback
  useEffect(() => {
    const token = apiClient.getToken ? apiClient.getToken() : localStorage.getItem('edufyi_token')
    if (!token) return

    let es = null
    try {
      es = new EventSource(\`/api/v1/notifications/stream?token=\${encodeURIComponent(token)}\`)
      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (payload.type === 'notification' && payload.data) {
            const notif = payload.data
            const id = String(notif.id || notif._id || notif.notificationId || '')
            if (!id) return
            setNotifications((prev) => {
              if (prev.some((n) => n.id === id || n._id === id)) return prev
              return [{ ...notif, id, _id: id, read: false }, ...prev]
            })
            if (!soundMuted) {
              try { playNotificationSound('notification') } catch {}
            }
          }
        } catch {}
      }
      es.onerror = () => {
        es?.close()
      }
    } catch {}

    return () => {
      es?.close()
    }
  }, [user?.id, user?.employeeId, soundMuted])

  // Reset notification IDs on user change
  useEffect(() => {
    prevNotifIdsRef.current = new Set()
    isFirstLoadRef.current = true
    syncUnifiedNotifications(true)
  }, [user?.id, user?.employeeId])`;

// 4. Update dismissal icon onClick
const oldDismiss = `<button
                                  type="button"
                                  title="Dismiss notification"
                                  style={{ border: 0, background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', padding: '1px 4px' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkOneRead(n)
                                  }}
                                >
                                  ✕
                                </button>`;

const newDismiss = `<button
                                  type="button"
                                  title="Remove notification"
                                  style={{ border: 0, background: 'transparent', color: '#94a3b8', fontSize: '12px', cursor: 'pointer', padding: '1px 4px' }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteOne(n)
                                  }}
                                >
                                  ✕
                                </button>`;

const normCode = code.replace(/\r\n/g, '\n');
const normClick = oldClick.replace(/\r\n/g, '\n');
const normMarkOne = oldMarkOne.replace(/\r\n/g, '\n');
const normDismiss = oldDismiss.replace(/\r\n/g, '\n');

if (normCode.includes(normClick) && normCode.includes(normMarkOne) && normCode.includes(normDismiss)) {
  let updated = normCode
    .replace(normClick, newClick)
    .replace(normMarkOne, `${newMarkAndDel}\n\n${sseBlock}`)
    .replace(normDismiss, newDismiss);
  fs.writeFileSync('src/components/HRLayout.jsx', updated.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated HRLayout.jsx');
} else {
  console.error('Target blocks not found in HRLayout.jsx');
}

