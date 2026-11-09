import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Trash2,
  Edit2,
  Copy,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Cake,
  Award,
  Sparkles,
  FileSpreadsheet,
  CalendarRange,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Info,
  Check,
  CalendarDays,
  Grid3X3,
  List,
  Layers,
  ExternalLink,
} from 'lucide-react'
import { Button, StatusBadge, Field } from '../ui'
import { hrStore } from '../../services/hrStore'
import { calendarService } from '../../services/calendarService'

const CATEGORY_COLORS = {
  'National Holiday': { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd', badge: 'info' },
  'Public Holiday': { bg: '#e0f2fe', text: '#0284c7', border: '#bae6fd', badge: 'info' },
  'Regional Holiday': { bg: '#ede9fe', text: '#6d28d9', border: '#ddd6fe', badge: 'neutral' },
  'Festival': { bg: '#fef3c7', text: '#b45309', border: '#fde68a', badge: 'warning' },
  'Company Holiday': { bg: '#ccfbf1', text: '#0f766e', border: '#99f6e4', badge: 'success' },
  'Optional Holiday': { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0', badge: 'neutral' },
  'Restricted Holiday': { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa', badge: 'warning' },
  'Special Holiday': { bg: '#fae8ff', text: '#a21caf', border: '#f5d0fe', badge: 'neutral' },
  'Emergency Holiday': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca', badge: 'danger' },
  'Birthday': { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8', badge: 'warning' },
  'Work Anniversary': { bg: '#fffbeb', text: '#d97706', border: '#fef3c7', badge: 'warning' },
  'Leave': { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe', badge: 'neutral' },
  'Event': { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0', badge: 'success' },
  'Meeting': { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', badge: 'info' },
  'Training': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', badge: 'success' },
  'Announcement': { bg: '#f8fafc', text: '#334155', border: '#e2e8f0', badge: 'neutral' },
}

const ALL_CATEGORIES = [
  'National Holiday',
  'Public Holiday',
  'Regional Holiday',
  'Festival',
  'Company Holiday',
  'Optional Holiday',
  'Restricted Holiday',
  'Special Holiday',
  'Emergency Holiday',
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function EnterpriseCalendar({ canManage = false, user = null, defaultView = 'month' }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [viewMode, setViewMode] = useState(defaultView) // 'month', 'agenda', 'week', 'day', 'year', 'gallery'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [showLeaves, setShowLeaves] = useState(true)
  const [copiedNotice, setCopiedNotice] = useState(false)

  // Responsive mobile layout detection
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false))
  const [isSmallScreen, setIsSmallScreen] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 640 : false))

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return
      const w = window.innerWidth
      setIsMobile(w < 1024)
      setIsSmallScreen(w < 640)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Form states for Add/Edit
  const [holidayForm, setHolidayForm] = useState({
    name: '',
    date: '',
    endDate: '',
    category: 'Company Holiday',
    location: 'All Locations',
    applicableDepartments: ['All'],
    applicableEmploymentTypes: ['All'],
    isPaid: true,
    isRecurring: false,
    description: '',
  })
  const [duplicateTargetYear, setDuplicateTargetYear] = useState(new Date().getFullYear() + 1)
  const [duplicateTargetDate, setDuplicateTargetDate] = useState('')

  // CSV Import State
  const [importRows, setImportRows] = useState([])
  const [importPreview, setImportPreview] = useState(null)
  const [isImporting, setIsImporting] = useState(false)

  // Visual Flyer Showcase State (preserving existing uploaded posters)
  const [flyerIndex, setFlyerIndex] = useState(0)
  const [isFlyerLightbox, setIsFlyerLightbox] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const flyerInputRef = useRef(null)

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  // Visual Flyer pictures from store
  const flyerImages = storeState.companySettings?.holidayCalendarImages || storeState.holidayCalendarImages || []

  // Reset zoom and bind keyboard navigation for flyer lightbox
  useEffect(() => {
    setZoomScale(1)
  }, [flyerIndex, isFlyerLightbox])

  useEffect(() => {
    if (!isFlyerLightbox) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFlyerLightbox(false)
      if (e.key === 'ArrowRight' && flyerImages.length > 1) {
        setFlyerIndex((prev) => (prev + 1) % flyerImages.length)
      }
      if (e.key === 'ArrowLeft' && flyerImages.length > 1) {
        setFlyerIndex((prev) => (prev - 1 + flyerImages.length) % flyerImages.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFlyerLightbox, flyerImages.length])

  // Helper: Generate Add to Google Calendar URL
  const getGoogleCalendarUrl = (ev) => {
    if (!ev?.date) return '#'
    const title = encodeURIComponent(ev.title || ev.name || 'Company Holiday')
    const start = (ev.date || '').replace(/-/g, '')
    const endDateObj = new Date(ev.endDate || ev.date)
    endDateObj.setDate(endDateObj.getDate() + 1)
    const end = endDateObj.toISOString().split('T')[0].replace(/-/g, '')
    const details = encodeURIComponent(
      `${ev.description ? ev.description + '\n\n' : ''}Category: ${ev.category || 'Holiday'}\nLocation: ${ev.location || 'All Offices'}\nEdufyi HR Portal`
    )
    const location = encodeURIComponent(ev.location || 'Edufyi Technologies')
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`
  }

  // Helper: Detect 3-day long weekends (Friday or Monday holiday)
  const isLongWeekend = (dateStr) => {
    if (!dateStr) return false
    const d = new Date(`${dateStr}T00:00:00Z`)
    if (isNaN(d.getTime())) return false
    const day = d.getUTCDay()
    return day === 1 || day === 5 // Monday or Friday
  }

  // Helper: Relative countdown
  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    if (isNaN(target.getTime())) return null
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return { label: 'Today', tone: 'success', days: 0 }
    if (diffDays === 1) return { label: 'Tomorrow', tone: 'info', days: 1 }
    if (diffDays > 1 && diffDays <= 7) return { label: `In ${diffDays} days`, tone: 'info', days: diffDays }
    if (diffDays > 7 && diffDays <= 30) return { label: `In ${diffDays} days`, tone: 'neutral', days: diffDays }
    if (diffDays > 30) return { label: `In ${diffDays} days`, tone: 'neutral', days: diffDays }
    return { label: 'Past', tone: 'muted', days: diffDays }
  }

  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  // Load calendar events whenever month/year/filters change
  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const data = await calendarService.getEvents({
        year: currentYear,
        month: (viewMode === 'year' || viewMode === 'agenda') ? null : currentMonth,
        category: categoryFilter,
        department: departmentFilter,
        search: searchQuery,
      })
      setEvents(data)
    } catch (err) {
      console.warn('Failed loading events:', err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [currentYear, currentMonth, categoryFilter, departmentFilter, searchQuery, viewMode])

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'year' || viewMode === 'agenda') {
      setCurrentDate(new Date(currentYear - 1, currentDate.getMonth(), 1))
    } else if (viewMode === 'week') {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 7)
      setCurrentDate(d)
    } else if (viewMode === 'day') {
      const d = new Date(currentDate)
      d.setDate(d.getDate() - 1)
      setCurrentDate(d)
      setSelectedDate(d.toISOString().split('T')[0])
    } else {
      setCurrentDate(new Date(currentYear, currentDate.getMonth() - 1, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === 'year' || viewMode === 'agenda') {
      setCurrentDate(new Date(currentYear + 1, currentDate.getMonth(), 1))
    } else if (viewMode === 'week') {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 7)
      setCurrentDate(d)
    } else if (viewMode === 'day') {
      const d = new Date(currentDate)
      d.setDate(d.getDate() + 1)
      setCurrentDate(d)
      setSelectedDate(d.toISOString().split('T')[0])
    } else {
      setCurrentDate(new Date(currentYear, currentDate.getMonth() + 1, 1))
    }
  }

  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today.toISOString().split('T')[0])
  }

  // Flash notice helper
  const showNotice = (msg, duration = 4000) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), duration)
  }

  // Open Add modal with prefilled date
  const openAddModal = (dateStr = null) => {
    const defaultDate = dateStr || selectedDate || new Date().toISOString().split('T')[0]
    setHolidayForm({
      name: '',
      date: defaultDate,
      endDate: defaultDate,
      category: 'Company Holiday',
      location: 'All Locations',
      applicableDepartments: ['All'],
      applicableEmploymentTypes: ['All'],
      isPaid: true,
      isRecurring: false,
      description: '',
    })
    setIsAddModalOpen(true)
  }

  // Open Edit modal
  const openEditModal = (ev) => {
    setHolidayForm({
      id: ev.entityId || ev.id,
      name: ev.name || ev.title,
      date: ev.date,
      endDate: ev.endDate || ev.date,
      category: ev.category || 'Company Holiday',
      location: ev.location || 'All Locations',
      applicableDepartments: ev.applicableDepartments || ['All'],
      applicableEmploymentTypes: ev.applicableEmploymentTypes || ['All'],
      isPaid: ev.isPaid !== false,
      isRecurring: Boolean(ev.isRecurring),
      description: ev.description || '',
    })
    setIsEditModalOpen(true)
    setSelectedEvent(null)
  }

  // Open Duplicate modal
  const openDuplicateModal = (ev) => {
    setSelectedEvent(ev)
    const nextYear = parseInt(ev.date.slice(0, 4), 10) + 1
    setDuplicateTargetYear(nextYear)
    setDuplicateTargetDate(`${nextYear}-${ev.date.slice(5)}`)
    setIsDuplicateModalOpen(true)
  }

  // Handle Create Holiday
  const handleCreateHoliday = async (e) => {
    e.preventDefault()
    if (!holidayForm.name || !holidayForm.date) {
      showNotice('Holiday name and date are required.')
      return
    }

    try {
      const res = await calendarService.createHoliday(holidayForm)
      if (res.success) {
        showNotice(`Holiday "${holidayForm.name}" created successfully!`)
        setIsAddModalOpen(false)
        loadEvents()
      } else {
        showNotice(res.message || 'Failed to create holiday.')
      }
    } catch (err) {
      showNotice(err.message || 'Error creating holiday.')
    }
  }

  // Handle Update Holiday
  const handleUpdateHoliday = async (e) => {
    e.preventDefault()
    if (!holidayForm.id || !holidayForm.name || !holidayForm.date) return

    try {
      const res = await calendarService.updateHoliday(holidayForm.id, holidayForm)
      if (res.success) {
        showNotice(`Holiday "${holidayForm.name}" updated successfully!`)
        setIsEditModalOpen(false)
        loadEvents()
      } else {
        showNotice(res.message || 'Failed to update holiday.')
      }
    } catch (err) {
      showNotice(err.message || 'Error updating holiday.')
    }
  }

  // Handle Delete Holiday
  const handleDeleteHoliday = async () => {
    if (!selectedEvent) return
    const id = selectedEvent.entityId || selectedEvent.id
    try {
      const res = await calendarService.deleteHoliday(id)
      if (res.success) {
        showNotice(`Holiday "${selectedEvent.title}" deleted.`)
        setIsDeleteModalOpen(false)
        setSelectedEvent(null)
        loadEvents()
      } else {
        showNotice(res.message || 'Failed to delete holiday.')
      }
    } catch (err) {
      showNotice(err.message || 'Error deleting holiday.')
    }
  }

  // Handle Duplicate Holiday
  const handleDuplicateHoliday = async (e) => {
    e.preventDefault()
    if (!selectedEvent) return
    const id = selectedEvent.entityId || selectedEvent.id
    try {
      const res = await calendarService.duplicateHoliday(id, {
        targetYear: duplicateTargetYear,
        targetDate: duplicateTargetDate,
      })
      if (res.success) {
        showNotice(`Holiday duplicated to ${duplicateTargetDate || duplicateTargetYear}!`)
        setIsDuplicateModalOpen(false)
        setSelectedEvent(null)
        loadEvents()
      } else {
        showNotice(res.message || 'Failed to duplicate holiday.')
      }
    } catch (err) {
      showNotice(err.message || 'Error duplicating holiday.')
    }
  }

  // Handle CSV File Upload for Import
  const handleCsvFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target?.result
      if (!text) return

      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
      if (lines.length < 2) {
        showNotice('CSV must contain a header row and at least one data row.')
        return
      }

      const headers = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim())
      const rows = []

      for (let i = 1; i < lines.length; i++) {
        // Simple regex CSV parser handling quotes
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',')
        const rowObj = {}
        headers.forEach((h, idx) => {
          rowObj[h] = (values[idx] || '').replace(/^["']|["']$/g, '').trim()
        })
        rows.push(rowObj)
      }

      setImportRows(rows)

      // Run dry-run validation preview
      try {
        const preview = await calendarService.bulkImportHolidays(rows, true)
        setImportPreview(preview)
      } catch (err) {
        showNotice('CSV preview validation error: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  // Commit CSV Import
  const handleCommitImport = async () => {
    if (!importRows || importRows.length === 0) return
    setIsImporting(true)
    try {
      const res = await calendarService.bulkImportHolidays(importRows, false)
      if (res.success) {
        showNotice(`Import complete! ${res.summary?.importedCount || 0} holidays added.`)
        setIsImportModalOpen(false)
        setImportRows([])
        setImportPreview(null)
        loadEvents()
      } else {
        showNotice(res.message || 'Import failed.')
      }
    } catch (err) {
      showNotice('Import failed: ' + err.message)
    } finally {
      setIsImporting(false)
    }
  }

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const sample = `Holiday Name,Date,End Date,Category,Location,Departments,Paid/Unpaid,Description\n"New Year Day","2027-01-01","2027-01-01","National Holiday","All Locations","All","Paid","Official company holiday welcoming 2027"\n"Republic Day","2027-01-26","2027-01-26","National Holiday","All Locations","All","Paid","Honoring the Indian Constitution"\n"Independence Day","2027-08-15","2027-08-15","National Holiday","All Locations","All","Paid","National independence celebration"\n"Diwali Celebration","2027-11-08","2027-11-09","Festival","All Locations","All","Paid","Festival of Lights holidays"`
    const blob = new Blob([sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'edufyi_holiday_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  // =========================================================================
  // MONTH GRID COMPUTATION
  // =========================================================================
  const monthCalendarDays = useMemo(() => {
    const year = currentYear
    const month = currentDate.getMonth()

    const firstDayIndex = new Date(year, month, 1).getDay()
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i
      const prevDate = new Date(year, month - 1, dayNum)
      const dateStr = prevDate.toISOString().split('T')[0]
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isPrevMonth: true,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i)
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        isToday: dateStr === new Date().toISOString().split('T')[0],
      })
    }

    // Next month leading days to complete grid (up to 35 or 42 cells)
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i)
      const dateStr = nextDate.toISOString().split('T')[0]
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        isNextMonth: true,
      })
    }

    return days
  }, [currentYear, currentDate])

  // Events indexed by date for O(1) cell lookup
  const eventsByDate = useMemo(() => {
    const map = new Map()
    events.forEach((ev) => {
      // If multi-day event, add to all covered dates
      if (ev.endDate && ev.endDate !== ev.date) {
        const start = new Date(ev.date)
        const end = new Date(ev.endDate)
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().split('T')[0]
          if (!map.has(key)) map.set(key, [])
          map.get(key).push(ev)
        }
      } else {
        const key = ev.date
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(ev)
      }
    })
    return map
  }, [events])

  // Selected date events for side-panel (respecting showLeaves toggle)
  const selectedDateEvents = useMemo(() => {
    return (eventsByDate.get(selectedDate) || []).filter((e) => showLeaves || e.type !== 'leave')
  }, [eventsByDate, selectedDate, showLeaves])

  // Summary Stats & Metrics
  const targetYearHolidays = useMemo(() => {
    return events.filter((e) => e.type === 'holiday' || (e.category && !['Birthday', 'Work Anniversary', 'Leave'].includes(e.category)))
  }, [events])

  const nextUpcomingHoliday = useMemo(() => {
    const list = targetYearHolidays.filter((h) => (h.date || '') >= selectedDate).sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    return list.length > 0 ? list[0] : (targetYearHolidays.length > 0 ? targetYearHolidays[0] : null)
  }, [targetYearHolidays, selectedDate])

  const monthCelebrationsCount = useMemo(() => {
    return events.filter((e) => {
      if (!e.isCelebration && !['Birthday', 'Work Anniversary'].includes(e.category)) return false
      if (!e.date) return false
      const m = parseInt(e.date.slice(5, 7), 10)
      return m === currentMonth
    }).length
  }, [events, currentMonth])

  // Grouped Agenda Events (chronological by year-month)
  const groupedAgendaEvents = useMemo(() => {
    const filtered = events.filter((ev) => {
      if (!showLeaves && ev.type === 'leave') return false
      return true
    }).sort((a, b) => (a.date || '').localeCompare(b.date || ''))

    const groups = {}
    filtered.forEach((ev) => {
      if (!ev.date) return
      const yearMonth = ev.date.slice(0, 7)
      if (!groups[yearMonth]) groups[yearMonth] = []
      groups[yearMonth].push(ev)
    })
    return groups
  }, [events, showLeaves])

  return (
    <div className="enterprise-calendar-module" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notice */}
      {notice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 18px',
            background: '#ecfdf5',
            color: '#065f46',
            borderRadius: '10px',
            border: '1px solid #a7f3d0',
            fontSize: '13px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={17} color="#059669" />
            <span>{notice}</span>
          </div>
          <button
            onClick={() => setNotice('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#065f46' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 0. ENTERPRISE INSIGHTS & STATS BAR                             */}
      {/* ============================================================== */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isSmallScreen ? 'repeat(2, 1fr)' : isMobile ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: isSmallScreen ? '8px' : '14px',
        }}
        className="calendar-stats-grid"
      >
        {/* Stat 1: Total Paid Holidays */}
        <div
          className="panel"
          style={{
            padding: isSmallScreen ? '10px 12px' : '14px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
            display: 'flex',
            alignItems: 'center',
            gap: isSmallScreen ? '8px' : '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              width: isSmallScreen ? '32px' : '42px',
              height: isSmallScreen ? '32px' : '42px',
              borderRadius: '10px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CalendarRange size={isSmallScreen ? 18 : 22} />
          </div>
          <div>
            <div style={{ fontSize: isSmallScreen ? '16px' : '20px', fontWeight: 800, color: 'var(--ink, #0f172a)', lineHeight: 1.1 }}>
              {targetYearHolidays.length} Days
            </div>
            <div style={{ fontSize: isSmallScreen ? '10px' : '11px', fontWeight: 600, color: 'var(--muted, #64748b)' }}>
              Official Holidays ({currentYear})
            </div>
          </div>
        </div>

        {/* Stat 2: Next Upcoming Holiday */}
        <div
          className="panel"
          style={{
            padding: isSmallScreen ? '10px 12px' : '14px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
            display: 'flex',
            alignItems: 'center',
            gap: isSmallScreen ? '8px' : '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              width: isSmallScreen ? '32px' : '42px',
              height: isSmallScreen ? '32px' : '42px',
              borderRadius: '10px',
              background: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={isSmallScreen ? 18 : 22} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            {nextUpcomingHoliday ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: isSmallScreen ? '12px' : '13px', fontWeight: 800, color: 'var(--ink, #0f172a)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {nextUpcomingHoliday.title || nextUpcomingHoliday.name}
                  </span>
                  {(() => {
                    const cd = getDaysUntil(nextUpcomingHoliday.date)
                    return cd ? (
                      <span style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '10px', background: cd.tone === 'success' ? '#dcfce7' : '#e0f2fe', color: cd.tone === 'success' ? '#166534' : '#0369a1' }}>
                        {cd.label}
                      </span>
                    ) : null
                  })()}
                </div>
                <div style={{ fontSize: isSmallScreen ? '10px' : '11px', fontWeight: 600, color: 'var(--muted, #64748b)' }}>
                  {nextUpcomingHoliday.date} ({nextUpcomingHoliday.day || 'Day'})
                  {isLongWeekend(nextUpcomingHoliday.date) && ' • 🎉 3-Day Weekend'}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)', fontWeight: 600 }}>
                No scheduled holidays soon
              </div>
            )}
          </div>
        </div>

        {/* Stat 3: Celebrations this Month */}
        <div
          className="panel"
          style={{
            padding: isSmallScreen ? '10px 12px' : '14px 18px',
            borderRadius: '12px',
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
            display: 'flex',
            alignItems: 'center',
            gap: isSmallScreen ? '8px' : '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              width: isSmallScreen ? '32px' : '42px',
              height: isSmallScreen ? '32px' : '42px',
              borderRadius: '10px',
              background: '#fdf2f8',
              color: '#db2777',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={isSmallScreen ? 18 : 22} />
          </div>
          <div>
            <div style={{ fontSize: isSmallScreen ? '16px' : '20px', fontWeight: 800, color: 'var(--ink, #0f172a)', lineHeight: 1.1 }}>
              {monthCelebrationsCount} Celebrations
            </div>
            <div style={{ fontSize: isSmallScreen ? '10px' : '11px', fontWeight: 600, color: 'var(--muted, #64748b)' }}>
              Birthdays & Milestones in {MONTH_NAMES[currentDate.getMonth()]}
            </div>
          </div>
        </div>

        {/* Stat 4: Official Flyers Banner */}
        {flyerImages.length > 0 ? (
          <div
            className="panel hover-card"
            onClick={() => setViewMode('gallery')}
            style={{
              padding: isSmallScreen ? '10px 12px' : '14px 18px',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            title="View printed official holiday schedule poster"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: isSmallScreen ? '6px' : '10px' }}>
              <Layers size={isSmallScreen ? 18 : 22} color="#0284c7" />
              <div>
                <div style={{ fontSize: isSmallScreen ? '12px' : '13px', fontWeight: 800, color: '#0369a1' }}>
                  Official Holiday Flyer
                </div>
                <div style={{ fontSize: isSmallScreen ? '10px' : '11px', color: '#0284c7', fontWeight: 600 }}>
                  {flyerImages.length} High-Res Sheet{flyerImages.length > 1 ? 's' : ''} Uploaded
                </div>
              </div>
            </div>
            <Eye size={16} color="#0369a1" />
          </div>
        ) : (
          <div
            className="panel hover-card"
            onClick={() => {
              calendarService.downloadExport('ics', currentYear)
            }}
            style={{
              padding: isSmallScreen ? '10px 12px' : '14px 18px',
              borderRadius: '12px',
              border: '1px solid var(--border, #e2e8f0)',
              background: 'var(--card-bg, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
            title="Download iCalendar format (.ics)"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CalendarRange size={22} color="var(--teal, #006E6F)" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
                  Sync Calendar (.ics)
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted, #64748b)', fontWeight: 600 }}>
                  Works with Google, Outlook & Apple
                </div>
              </div>
            </div>
            <Download size={16} color="var(--teal, #006E6F)" />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* CALENDAR HEADER & CONTROLS TOOLBAR                             */}
      {/* ============================================================== */}
      <div
        className="panel calendar-control-panel"
        style={{
          padding: isSmallScreen ? '12px 10px' : '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: isSmallScreen ? '12px' : '16px',
          background: 'var(--card-bg, #ffffff)',
          borderRadius: '14px',
          border: '1px solid var(--border, #e2e8f0)',
        }}
      >
        <div
          className="calendar-header-top"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: isSmallScreen ? '10px' : '14px',
          }}
        >
          {/* Month / Year Title & Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', width: isSmallScreen ? '100%' : 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: isSmallScreen ? '34px' : '40px',
                  height: isSmallScreen ? '34px' : '40px',
                  borderRadius: '10px',
                  background: 'var(--teal-soft, #e6f4f1)',
                  color: 'var(--teal, #006E6F)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CalendarIcon size={isSmallScreen ? 18 : 20} />
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: isSmallScreen ? '18px' : '22px', fontWeight: 800, color: 'var(--ink, #0f172a)', lineHeight: 1.2 }}>
                  {viewMode === 'year'
                    ? `${currentYear}`
                    : `${MONTH_NAMES[currentDate.getMonth()]} ${currentYear}`}
                </h1>
                <p style={{ margin: 0, fontSize: isSmallScreen ? '10.5px' : '12px', color: 'var(--muted, #64748b)' }}>
                  Enterprise Smart Calendar & Workforce Operations
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: isSmallScreen ? 'auto' : 0 }}>
              <Button variant="ghost" onClick={handlePrev} title="Previous" style={{ padding: isSmallScreen ? '4px 6px' : '6px 10px' }}>
                <ChevronLeft size={isSmallScreen ? 16 : 18} />
              </Button>
              <Button variant="outline" onClick={handleToday} style={{ fontWeight: 600, padding: isSmallScreen ? '4px 10px' : '6px 14px', fontSize: isSmallScreen ? '11.5px' : '13px' }}>
                Today
              </Button>
              <Button variant="ghost" onClick={handleNext} title="Next" style={{ padding: isSmallScreen ? '4px 6px' : '6px 10px' }}>
                <ChevronRight size={isSmallScreen ? 16 : 18} />
              </Button>

              {/* Direct Month Picker */}
              <input
                type="month"
                value={`${currentYear}-${String(currentMonth).padStart(2, '0')}`}
                onChange={(e) => {
                  if (!e.target.value) return
                  const [y, m] = e.target.value.split('-').map(Number)
                  setCurrentDate(new Date(y, m - 1, 1))
                }}
                title="Jump to specific month and year"
                style={{
                  padding: '4px 8px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #cbd5e1)',
                  fontSize: '11px',
                  color: 'var(--ink, #334155)',
                  background: 'var(--card-bg, #ffffff)',
                  cursor: 'pointer',
                  marginLeft: '4px',
                }}
              />
            </div>
          </div>

          {/* View Mode Switcher + Scope + Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: isSmallScreen ? '100%' : 'auto', justifyContent: isSmallScreen ? 'space-between' : 'flex-end' }}>
            {/* Scope Filter Switcher (Company / Team / My Calendar) */}
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--surface-hover, #f1f5f9)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
              }}
            >
              {[
                { id: 'all', label: 'Company' },
                { id: 'team', label: 'Team' },
                { id: 'my', label: 'My Calendar' },
              ].map((s) => {
                const active = scopeFilter === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setScopeFilter(s.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#ffffff' : 'var(--ink, #475569)',
                      background: active ? 'var(--teal, #006E6F)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>

            {/* View switcher buttons */}
            <div
              className="calendar-view-switcher"
              style={{
                display: 'inline-flex',
                background: 'var(--surface-hover, #f1f5f9)',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid var(--border, #e2e8f0)',
                overflowX: 'auto',
                maxWidth: '100%',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
              }}
            >
              {[
                { id: 'month', label: 'Month', icon: CalendarDays },
                { id: 'week', label: 'Week', icon: Clock },
                { id: 'day', label: 'Day', icon: CalendarIcon },
                { id: 'agenda', label: 'Schedule', icon: List },
                { id: 'upcoming', label: 'Upcoming', icon: Target },
                { id: 'year', label: 'Year', icon: Grid3X3 },
                { id: 'gallery', label: 'Flyers', icon: Layers },
              ].map((v) => {
                const Icon = v.icon
                const active = viewMode === v.id
                return (
                  <button
                    key={v.id}
                    onClick={() => setViewMode(v.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: isSmallScreen ? '5px 8px' : '6px 12px',
                      fontSize: isSmallScreen ? '11px' : '12px',
                      fontWeight: active ? 700 : 500,
                      color: active ? '#ffffff' : 'var(--ink, #334155)',
                      background: active ? 'var(--teal, #006E6F)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={13} />
                    <span>{v.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Export Dropdown */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                variant="outline"
                onClick={() => calendarService.downloadExport('csv', currentYear)}
                title="Download CSV"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isSmallScreen ? '6px 8px' : '7px 12px' }}
              >
                <Download size={14} />
                <span className="hidden-mobile">CSV</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => calendarService.downloadExport('ics', currentYear)}
                title="Export to iCalendar / Outlook / Google Calendar"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isSmallScreen ? '6px 8px' : '7px 12px' }}
              >
                <CalendarRange size={14} />
                <span className="hidden-mobile">iCal (ICS)</span>
              </Button>
            </div>

            {/* Schedule Event Action (Primary for all users) */}
            <Button
              variant="primary"
              onClick={() => {
                setEditingEventData(null)
                setIsEventModalOpen(true)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isSmallScreen ? '6px 10px' : '7px 14px' }}
            >
              <Plus size={15} />
              <span>Schedule Event</span>
            </Button>

            {/* Admin Management Actions */}
            {canManage && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <Button
                  variant="outline"
                  onClick={() => setIsImportModalOpen(true)}
                  title="Bulk Import Holidays via CSV"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isSmallScreen ? '6px 8px' : '7px 12px' }}
                >
                  <Upload size={14} />
                  <span className="hidden-mobile">Import</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => openAddModal()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: isSmallScreen ? '6px 10px' : '7px 12px' }}
                >
                  <Plus size={15} />
                  <span className="hidden-mobile">Holiday</span>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          className="calendar-filter-bar"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: isSmallScreen ? '10px' : '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border, #f1f5f9)',
          }}
        >
          {/* Category Filter Pills */}
          <div
            className="calendar-category-pills"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '4px',
              maxWidth: '100%',
              width: isSmallScreen ? '100%' : 'auto',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              flexWrap: 'nowrap',
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--muted, #64748b)', textTransform: 'uppercase', marginRight: '4px', flexShrink: 0 }}>
              Category:
            </span>
            {[
              { id: 'all', label: 'All Events' },
              { id: 'Company Meeting', label: '💼 Meetings' },
              { id: 'Company Holiday', label: '🌴 Holidays' },
              { id: 'Employee Birthday', label: '🎂 Birthdays' },
              { id: 'Work Anniversary', label: '🎖️ Anniversaries' },
              { id: 'Project Deadline', label: '🎯 Deadlines' },
              { id: 'Training Session', label: '🎓 Training' },
              { id: 'leave', label: '🏖️ Leaves' },
            ].map((cat) => {
              const active = categoryFilter === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  style={{
                    padding: isSmallScreen ? '3px 8px' : '4px 10px',
                    fontSize: isSmallScreen ? '11px' : '12px',
                    fontWeight: active ? 700 : 500,
                    borderRadius: '20px',
                    border: active ? '1px solid var(--teal, #006E6F)' : '1px solid var(--border, #e2e8f0)',
                    background: active ? 'var(--teal-soft, #e6f4f1)' : 'transparent',
                    color: active ? 'var(--teal, #006E6F)' : 'var(--ink, #475569)',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {cat.label}
                </button>
              )
            })}

            {/* Leaves Toggle */}
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: isSmallScreen ? '3px 8px' : '4px 10px',
                borderRadius: '20px',
                border: showLeaves ? '1px solid #c4b5fd' : '1px solid var(--border, #e2e8f0)',
                background: showLeaves ? '#f5f3ff' : 'transparent',
                color: showLeaves ? '#6d28d9' : 'var(--ink, #475569)',
                fontSize: isSmallScreen ? '11px' : '12px',
                fontWeight: showLeaves ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                userSelect: 'none',
                flexShrink: 0,
              }}
            >
              <input
                type="checkbox"
                checked={showLeaves}
                onChange={(e) => setShowLeaves(e.target.checked)}
                style={{ cursor: 'pointer', margin: 0 }}
              />
              <span>🏖️ Team Leaves</span>
            </label>
          </div>

          {/* Department Filter & Search */}
          <div
            className="calendar-search-filters"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              width: isSmallScreen ? '100%' : 'auto',
            }}
          >
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                fontSize: '12px',
                color: 'var(--ink, #334155)',
                background: 'var(--card-bg, #ffffff)',
                flex: isSmallScreen ? '1 1 100%' : '0 0 auto',
                width: isSmallScreen ? '100%' : 'auto',
              }}
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
            </select>

            <div style={{ position: 'relative', minWidth: isSmallScreen ? '100%' : '180px', width: isSmallScreen ? '100%' : 'auto', flex: isSmallScreen ? '1 1 100%' : '1 1 auto' }}>
              <Search
                size={14}
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted, #94a3b8)' }}
              />
              <input
                type="text"
                placeholder="Search event or person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px 6px 30px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #cbd5e1)',
                  fontSize: '12px',
                  outline: 'none',
                  background: 'var(--card-bg, #ffffff)',
                  boxSizing: 'border-box',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#94a3b8',
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MAIN VIEWPORT: MONTH / WEEK / DAY / YEAR / FLYERS              */}
      {/* ============================================================== */}
      {viewMode === 'month' && (
        <div
          className="calendar-grid-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 320px',
            gap: isMobile ? '16px' : '20px',
            alignItems: 'start',
            width: '100%',
          }}
        >
          {/* Calendar Month Grid */}
          <div
            className="panel calendar-month-panel"
            style={{
              padding: isSmallScreen ? '10px 6px' : '16px',
              borderRadius: '14px',
              border: '1px solid var(--border, #e2e8f0)',
              background: 'var(--card-bg, #ffffff)',
              overflowX: 'hidden',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Day Header Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: isSmallScreen ? '2px' : '4px',
                textAlign: 'center',
                marginBottom: '8px',
                width: '100%',
              }}
            >
              {DAY_NAMES.map((day, idx) => (
                <div
                  key={day}
                  style={{
                    padding: isSmallScreen ? '4px 1px' : '8px 4px',
                    fontSize: isSmallScreen ? '10.5px' : '12px',
                    fontWeight: 700,
                    color: idx === 0 || idx === 6 ? '#ef4444' : 'var(--muted, #64748b)',
                    textTransform: 'uppercase',
                    letterSpacing: isSmallScreen ? '0' : '0.05em',
                  }}
                >
                  {isSmallScreen ? day.slice(0, 3) : day}
                </div>
              ))}
            </div>

            {/* 7-Column Days Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: isSmallScreen ? '3px' : '6px',
                width: '100%',
              }}
            >
              {monthCalendarDays.map((cell) => {
                const cellEvents = (eventsByDate.get(cell.dateStr) || []).filter((e) => showLeaves || e.type !== 'leave')
                const isSelected = selectedDate === cell.dateStr
                const maxVisible = 2
                const hiddenCount = cellEvents.length - maxVisible

                return (
                  <div
                    key={cell.dateStr}
                    onClick={() => {
                      setSelectedDate(cell.dateStr)
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(e) => handleDropOnDate(e, cell.dateStr)}
                    onDoubleClick={() => {
                      if (cell.isCurrentMonth) {
                        setEditingEventData({ date: cell.dateStr })
                        setIsEventModalOpen(true)
                      }
                    }}
                    style={{
                      minHeight: isSmallScreen ? '56px' : '92px',
                      padding: isSmallScreen ? '4px 2px' : '6px',
                      borderRadius: isSmallScreen ? '8px' : '10px',
                      border: isSelected
                        ? '2px solid var(--teal, #006E6F)'
                        : cell.isToday
                        ? '2px solid #38bdf8'
                        : '1px solid var(--border, #f1f5f9)',
                      background: isSelected
                        ? 'var(--teal-soft, #f0fdfa)'
                        : cell.isToday
                        ? '#f0f9ff'
                        : cell.isCurrentMonth
                        ? 'var(--card-bg, #ffffff)'
                        : 'var(--surface-hover, #f8fafc)',
                      opacity: cell.isCurrentMonth ? 1 : 0.45,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 110, 111, 0.14)' : 'none',
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* Day Number Header */}
                    <div style={{ display: 'flex', justifyContent: isSmallScreen ? 'center' : 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: isSmallScreen ? '11px' : '13px',
                          fontWeight: cell.isToday || isSelected ? 800 : 600,
                          color: cell.isToday
                            ? '#0284c7'
                            : isSelected
                            ? 'var(--teal, #006E6F)'
                            : 'var(--ink, #1e293b)',
                          width: isSmallScreen ? '22px' : '24px',
                          height: isSmallScreen ? '22px' : '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '50%',
                          background: cell.isToday ? '#e0f2fe' : isSelected ? '#ccfbf1' : 'transparent',
                        }}
                      >
                        {cell.dayNum}
                      </span>

                      {/* Small badge count if multiple events on desktop */}
                      {!isSmallScreen && cellEvents.length > 0 && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '10px',
                            background: '#f1f5f9',
                            color: '#475569',
                          }}
                        >
                          {cellEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events display: Mobile dots vs Desktop pills */}
                    {isSmallScreen ? (
                      <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', alignItems: 'center', minHeight: '14px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {cellEvents.slice(0, 3).map((ev) => {
                          const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Company Holiday']
                          return (
                            <span
                              key={ev.id}
                              title={`${ev.title} (${ev.category})`}
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: styleInfo.text || '#006E6F',
                                display: 'inline-block',
                                flexShrink: 0,
                              }}
                            />
                          )
                        })}
                        {cellEvents.length > 3 && (
                          <span style={{ fontSize: '8px', fontWeight: 800, color: 'var(--teal, #006E6F)', lineHeight: 1 }}>
                            +{cellEvents.length - 3}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                        {cellEvents.slice(0, maxVisible).map((ev) => {
                          const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Company Holiday']
                          return (
                            <div
                              key={ev.id}
                              draggable={Boolean(canManage || ev.isOwner)}
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', JSON.stringify({ id: ev.entityId || ev.id, title: ev.title }))
                              }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEvent(ev)
                                setSelectedDate(cell.dateStr)
                              }}
                              title={`${ev.title} (${ev.category})`}
                              style={{
                                padding: '2px 5px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 600,
                                background: styleInfo.bg,
                                color: styleInfo.text,
                                border: `1px solid ${styleInfo.border}`,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              {ev.type === 'birthday' && <Cake size={10} />}
                              {ev.type === 'anniversary' && <Award size={10} />}
                              <span>{ev.title}</span>
                            </div>
                          )
                        })}

                        {hiddenCount > 0 && (
                          <div
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: 'var(--teal, #006E6F)',
                              padding: '1px 4px',
                            }}
                          >
                            +{hiddenCount} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Side / Bottom Panel: Selected Date Agenda */}
          <div
            className="panel calendar-agenda-panel"
            style={{
              padding: isSmallScreen ? '14px 12px' : '18px',
              borderRadius: '14px',
              border: '1px solid var(--border, #e2e8f0)',
              background: 'var(--card-bg, #ffffff)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="eyebrow" style={{ fontSize: '11px', color: 'var(--teal, #006E6F)', fontWeight: 700 }}>
                  Selected Date Agenda
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
                  {new Date(`${selectedDate}T00:00:00Z`).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    timeZone: 'UTC',
                  })}
                </h3>
              </div>

              {canManage && (
                <Button variant="ghost" onClick={() => openAddModal(selectedDate)} title="Add event on this date">
                  <Plus size={16} />
                </Button>
              )}
            </div>

            {/* List of events on this day */}
            {selectedDateEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedDateEvents.map((ev) => {
                  const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Company Holiday']
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: `1px solid ${styleInfo.border}`,
                        background: styleInfo.bg,
                        color: styleInfo.text,
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {ev.category}
                        </span>
                        {ev.isPaid && (
                          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.7)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            Paid Off
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '4px' }}>
                        {ev.title}
                      </div>

                      {ev.description && (
                        <p style={{ margin: '0 0 6px', fontSize: '12px', opacity: 0.9, lineHeight: 1.4 }}>
                          {ev.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', opacity: 0.85, flexWrap: 'wrap' }}>
                        {ev.location && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <MapPin size={11} /> {ev.location}
                          </span>
                        )}
                        {ev.department && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Users size={11} /> {ev.department}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <a
                          href={getGoogleCalendarUrl(ev)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: styleInfo.text,
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                          onClick={(e) => e.stopPropagation()}
                          title="Add event to Google Calendar"
                        >
                          <ExternalLink size={12} />
                          <span>Add to G-Cal</span>
                        </a>

                        {isLongWeekend(ev.date) && (
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#b45309' }}>
                            🎉 3-Day Weekend
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '30px 16px',
                  textAlign: 'center',
                  background: 'var(--surface-hover, #f8fafc)',
                  borderRadius: '10px',
                  color: 'var(--muted, #64748b)',
                }}
              >
                <CalendarDays size={32} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>No official events scheduled.</p>
                {canManage && (
                  <button
                    onClick={() => openAddModal(selectedDate)}
                    style={{
                      marginTop: '10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--teal, #006E6F)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    + Schedule holiday on this day
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* AGENDA / SCHEDULE LIST VIEW                                    */}
      {/* ============================================================== */}
      {viewMode === 'agenda' && (
        <div
          className="panel"
          style={{
            padding: '24px',
            borderRadius: '14px',
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px', color: 'var(--teal, #006E6F)', fontWeight: 700 }}>
                Chronological Schedule & Holidays
              </span>
              <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
                Upcoming Holidays & Company Events ({Object.values(groupedAgendaEvents).flat().length})
              </h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {canManage && (
                <Button variant="primary" onClick={() => openAddModal()}>
                  <Plus size={16} /> Add Holiday
                </Button>
              )}
            </div>
          </div>

          {/* Grouped Agenda Months */}
          {Object.keys(groupedAgendaEvents).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.keys(groupedAgendaEvents).sort().map((groupKey) => {
                const [yStr, mStr] = groupKey.split('-')
                const monthTitle = `${MONTH_NAMES[parseInt(mStr, 10) - 1]} ${yStr}`
                const groupItems = groupedAgendaEvents[groupKey]

                return (
                  <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: '8px',
                        borderBottom: '2px solid var(--border, #f1f5f9)',
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--ink, #1e293b)' }}>
                        {monthTitle}
                      </h3>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted, #64748b)', background: '#f1f5f9', padding: '2px 8px', borderRadius: '12px' }}>
                        {groupItems.length} Event{groupItems.length > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {groupItems.map((ev) => {
                        const styleInfo = CATEGORY_COLORS[ev.category] || CATEGORY_COLORS['Company Holiday']
                        const countdown = getDaysUntil(ev.date)
                        const longWeekend = isLongWeekend(ev.date)
                        const isPast = countdown?.label === 'Past'

                        return (
                          <div
                            key={ev.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 18px',
                              borderRadius: '12px',
                              border: `1px solid ${styleInfo.border}`,
                              background: isPast ? '#fafafa' : styleInfo.bg,
                              opacity: isPast ? 0.75 : 1,
                              flexWrap: 'wrap',
                              gap: '14px',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px', flex: 1 }}>
                              {/* Date Block */}
                              <div
                                style={{
                                  minWidth: '58px',
                                  textAlign: 'center',
                                  padding: '8px 10px',
                                  borderRadius: '10px',
                                  background: '#ffffff',
                                  border: `1px solid ${styleInfo.border}`,
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                }}
                              >
                                <div style={{ fontSize: '10px', fontWeight: 800, color: styleInfo.text, textTransform: 'uppercase' }}>
                                  {MONTH_NAMES[parseInt(ev.date.slice(5, 7), 10) - 1]?.slice(0, 3)}
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--ink, #0f172a)', lineHeight: 1.1 }}>
                                  {ev.date.slice(8, 10)}
                                </div>
                                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--muted, #64748b)' }}>
                                  {ev.day?.slice(0, 3) || 'Day'}
                                </div>
                              </div>

                              {/* Details */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      fontWeight: 800,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.04em',
                                      padding: '2px 8px',
                                      borderRadius: '6px',
                                      background: '#ffffff',
                                      color: styleInfo.text,
                                      border: `1px solid ${styleInfo.border}`,
                                    }}
                                  >
                                    {ev.category}
                                  </span>

                                  {countdown && !isPast && (
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        background: countdown.tone === 'success' ? '#dcfce7' : countdown.tone === 'info' ? '#e0f2fe' : '#f1f5f9',
                                        color: countdown.tone === 'success' ? '#166534' : countdown.tone === 'info' ? '#0369a1' : '#64748b',
                                      }}
                                    >
                                      {countdown.label}
                                    </span>
                                  )}

                                  {longWeekend && (
                                    <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#fef3c7', color: '#b45309' }}>
                                      🎉 3-Day Weekend
                                    </span>
                                  )}

                                  {ev.isPaid && (
                                    <span style={{ fontSize: '10px', fontWeight: 600, color: '#059669' }}>
                                      • Paid Day Off
                                    </span>
                                  )}
                                </div>

                                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
                                  {ev.title}
                                </h4>

                                {ev.description && (
                                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted, #475569)', lineHeight: 1.4 }}>
                                    {ev.description}
                                  </p>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'var(--muted, #64748b)', marginTop: '2px' }}>
                                  {ev.location && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <MapPin size={11} /> {ev.location}
                                    </span>
                                  )}
                                  {ev.department && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Users size={11} /> {ev.department}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <a
                                href={getGoogleCalendarUrl(ev)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border, #cbd5e1)',
                                  background: '#ffffff',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#0284c7',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                }}
                                title="Add event to Google Calendar"
                              >
                                <ExternalLink size={13} />
                                <span>Add to G-Cal</span>
                              </a>

                              <Button variant="outline" onClick={() => setSelectedEvent(ev)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                                Details
                              </Button>

                              {canManage && ev.type === 'holiday' && (
                                <>
                                  <Button variant="ghost" onClick={() => openEditModal(ev)} title="Edit Holiday" style={{ padding: '6px' }}>
                                    <Edit2 size={14} />
                                  </Button>
                                  <Button variant="ghost" onClick={() => openDuplicateModal(ev)} title="Duplicate Holiday" style={{ padding: '6px' }}>
                                    <Copy size={14} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    onClick={() => {
                                      setSelectedEvent(ev)
                                      setIsDeleteModalOpen(true)
                                    }}
                                    title="Delete Holiday"
                                    style={{ color: '#ef4444', padding: '6px' }}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted, #64748b)' }}>
              <CalendarDays size={40} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
              <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700 }}>No holidays or events found</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>Try clearing your search query or filters.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* UPCOMING EVENTS VIEW                                           */}
      {/* ============================================================== */}
      {viewMode === 'upcoming' && (
        <UpcomingEventsView
          events={events}
          onSelectEvent={setSelectedEvent}
          onCreateEvent={() => {
            setEditingEventData(null)
            setIsEventModalOpen(true)
          }}
          canManage={canManage}
        />
      )}

      {/* ============================================================== */}
      {/* WEEK VIEW (HOURLY TIMELINE & INTERACTIVE BLOCKS)               */}
      {/* ============================================================== */}
      {viewMode === 'week' && (
        <WeeklyCalendarView
          currentDate={currentDate}
          events={events}
          onSelectDate={(d) => {
            setSelectedDate(d)
            setViewMode('day')
          }}
          onSelectEvent={setSelectedEvent}
          onCreateEvent={(d) => {
            setEditingEventData({ date: d })
            setIsEventModalOpen(true)
          }}
          isSmallScreen={isSmallScreen}
        />
      )}

      {/* ============================================================== */}
      {/* DAY VIEW (HOURLY DETAILED BREAKDOWN)                           */}
      {/* ============================================================== */}
      {viewMode === 'day' && (
        <DailyCalendarView
          selectedDate={selectedDate}
          events={events}
          onSelectEvent={setSelectedEvent}
          onCreateEvent={(d) => {
            setEditingEventData({ date: d })
            setIsEventModalOpen(true)
          }}
          canManage={canManage}
        />
      )}

      {/* ============================================================== */}
      {/* YEAR VIEW: 12 MINI MONTHS                                      */}
      {/* ============================================================== */}
      {viewMode === 'year' && (
        <div
          className="panel"
          style={{
            padding: isSmallScreen ? '14px 10px' : '24px',
            borderRadius: '14px',
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: isSmallScreen ? '1fr' : isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(240px, 1fr))', gap: isSmallScreen ? '12px' : '20px' }}>
            {MONTH_NAMES.map((monthName, mIdx) => {
              const daysInM = new Date(currentYear, mIdx + 1, 0).getDate()
              const firstDay = new Date(currentYear, mIdx, 1).getDay()

              return (
                <div
                  key={monthName}
                  onClick={() => {
                    setCurrentDate(new Date(currentYear, mIdx, 1))
                    setViewMode('month')
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border, #e2e8f0)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  className="hover-card"
                >
                  <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--ink, #0f172a)', marginBottom: '8px', textAlign: 'center' }}>
                    {monthName}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '9px', fontWeight: 700, color: 'var(--muted, #94a3b8)', marginBottom: '4px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center', fontSize: '10px' }}>
                    {Array.from({ length: firstDay }).map((_, i) => (
                      <span key={`empty-${i}`} />
                    ))}
                    {Array.from({ length: daysInM }).map((_, i) => {
                      const dayNum = i + 1
                      const dateStr = `${currentYear}-${String(mIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                      const dayEvents = eventsByDate.get(dateStr) || []
                      const hasHoliday = dayEvents.some((e) => e.type === 'holiday')
                      const hasCelebration = dayEvents.some((e) => e.isCelebration)

                      return (
                        <div
                          key={dayNum}
                          style={{
                            padding: '3px 0',
                            borderRadius: '4px',
                            fontWeight: dayEvents.length > 0 ? 800 : 500,
                            background: hasHoliday ? '#e0f2fe' : hasCelebration ? '#fef3c7' : 'transparent',
                            color: hasHoliday ? '#0369a1' : hasCelebration ? '#b45309' : 'inherit',
                          }}
                        >
                          {dayNum}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VISUAL FLYER PICTURES GALLERY TAB (PRESERVING EXISTING UPLOADS)*/}
      {/* ============================================================== */}
      {viewMode === 'gallery' && (
        <div
          className="panel"
          style={{
            padding: '24px',
            borderRadius: '14px',
            border: '1px solid var(--border, #e2e8f0)',
            background: 'var(--card-bg, #ffffff)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <span className="eyebrow" style={{ fontSize: '11px', color: 'var(--teal, #006E6F)', fontWeight: 700 }}>
                Visual Calendar Gallery
              </span>
              <h2 style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 800, color: 'var(--ink, #0f172a)' }}>
                Official Printed Holiday Schedules & Flyers
              </h2>
            </div>

            {canManage && (
              <div>
                <input
                  ref={flyerInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const files = e.target.files
                    if (!files || files.length === 0) return
                    const newItems = []
                    for (let i = 0; i < files.length; i++) {
                      const file = files[i]
                      const reader = new FileReader()
                      const dataUrl = await new Promise((res) => {
                        reader.onload = (ev) => res(ev.target.result)
                        reader.readAsDataURL(file)
                      })
                      newItems.push({
                        id: `flyer-${Date.now()}-${i}`,
                        url: dataUrl,
                        title: file.name.replace(/\.[^/.]+$/, ''),
                        uploadedAt: new Date().toISOString().split('T')[0],
                      })
                    }
                    hrStore.uploadHolidayCalendarImages(newItems, user?.name || 'Admin')
                    showNotice(`Uploaded ${newItems.length} calendar posters!`)
                  }}
                />
                <Button variant="primary" onClick={() => flyerInputRef.current?.click()}>
                  <Upload size={15} /> Upload Calendar Flyer
                </Button>
              </div>
            )}
          </div>

          {flyerImages.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
              {flyerImages.map((img, idx) => (
                <div
                  key={img.id || idx}
                  style={{
                    borderRadius: '12px',
                    border: '1px solid var(--border, #e2e8f0)',
                    overflow: 'hidden',
                    background: '#f8fafc',
                  }}
                >
                  <img
                    src={img.url}
                    alt={img.title || 'Calendar'}
                    style={{ width: '100%', height: '220px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => {
                      setFlyerIndex(idx)
                      setIsFlyerLightbox(true)
                    }}
                  />
                  <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '13px' }}>{img.title || `Calendar Flyer ${idx + 1}`}</div>
                    {canManage && (
                      <Button
                        variant="ghost"
                        onClick={() => hrStore.deleteHolidayCalendarImage(img.id, user?.name || 'Admin')}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted, #64748b)' }}>
              <Layers size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>No visual flyers uploaded yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* FULLSCREEN FLYER FIT-SCREEN LIGHTBOX MODAL                     */}
      {/* ============================================================== */}
      {isFlyerLightbox && flyerImages[flyerIndex] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(10, 15, 29, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 24px',
          }}
          onClick={() => setIsFlyerLightbox(false)}
        >
          {/* Lightbox Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              zIndex: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: '16px',
                }}
              >
                Sheet {flyerIndex + 1} of {flyerImages.length}
              </span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 700 }}>
                {flyerImages[flyerIndex].title || `Holiday Calendar Poster ${flyerIndex + 1}`}
              </span>
              {flyerImages[flyerIndex].uploadedAt && (
                <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                  Uploaded {flyerImages[flyerIndex].uploadedAt}
                </span>
              )}
            </div>

            {/* Lightbox Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(0.6, s - 0.25))}
                title="Zoom Out"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                }}
              >
                <ZoomOut size={16} />
              </button>
              <span style={{ color: '#ffffff', fontSize: '12px', minWidth: '45px', textAlign: 'center', fontWeight: 600 }}>
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.min(3, s + 0.25))}
                title="Zoom In"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                }}
              >
                <ZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => setZoomScale(1)}
                title="Reset Zoom"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                100%
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  const img = flyerImages[flyerIndex]
                  if (!img?.url) return
                  const a = document.createElement('a')
                  a.href = img.url
                  a.download = `${img.title || 'company-holiday-calendar'}.png`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                }}
                title="Download Original High-Res Image"
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} />
                <span>Save Poster</span>
              </button>

              {canManage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    const img = flyerImages[flyerIndex]
                    if (window.confirm(`Delete calendar flyer "${img.title || 'Sheet'}"?`)) {
                      hrStore.deleteHolidayCalendarImage(img.id, user?.name || 'Admin')
                      showNotice('Calendar flyer removed.')
                      if (flyerIndex > 0) setFlyerIndex(flyerIndex - 1)
                      else setIsFlyerLightbox(false)
                    }
                  }}
                  title="Delete this flyer"
                  style={{
                    background: 'rgba(239, 68, 68, 0.25)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#fca5a5',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFlyerLightbox(false)}
                title="Close Fullscreen (Esc)"
                style={{
                  background: 'rgba(239, 68, 68, 0.35)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: '8px',
                }}
              >
                <X size={16} />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Fit-Screen Ratio Image Viewport */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              padding: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={flyerImages[flyerIndex].url}
              alt={flyerImages[flyerIndex].title || 'Official Holiday Calendar Fullscreen'}
              style={{
                maxWidth: '96vw',
                maxHeight: '84vh',
                objectFit: 'contain',
                transform: `scale(${zoomScale})`,
                transition: 'transform 0.15s ease-out',
                borderRadius: '8px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              }}
            />

            {/* Left / Right Nav in Lightbox */}
            {flyerImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setFlyerIndex((prev) => (prev - 1 + flyerImages.length) % flyerImages.length)}
                  title="Previous sheet (Left Arrow)"
                  style={{
                    position: 'fixed',
                    left: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
                    zIndex: 20,
                  }}
                >
                  <ChevronLeft size={28} />
                </button>

                <button
                  type="button"
                  onClick={() => setFlyerIndex((prev) => (prev + 1) % flyerImages.length)}
                  title="Next sheet (Right Arrow)"
                  style={{
                    position: 'fixed',
                    right: '24px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
                    zIndex: 20,
                  }}
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer Thumbnail Strip */}
          {flyerImages.length > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
                zIndex: 10,
                padding: '8px 0',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {flyerImages.map((img, idx) => {
                const isActive = idx === flyerIndex
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setFlyerIndex(idx)}
                    style={{
                      width: '64px',
                      height: '42px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      padding: 0,
                      border: isActive ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.25)',
                      opacity: isActive ? 1 : 0.6,
                      cursor: 'pointer',
                      background: '#0f172a',
                    }}
                  >
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* ENTERPRISE EVENT DETAIL MODAL (RSVP, MEET, MAPS, ATTENDEES)    */}
      {/* ============================================================== */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onEdit={(ev) => {
            if (ev.type === 'holiday') {
              openEditModal(ev)
            } else {
              setEditingEventData(ev)
              setIsEventModalOpen(true)
            }
          }}
          onDeleted={() => {
            loadEvents()
            setSelectedEvent(null)
          }}
          onRsvpUpdated={() => {
            loadEvents()
          }}
          user={user}
          canManage={canManage}
          categoryStyles={CATEGORY_COLORS}
        />
      )}

      {/* ============================================================== */}
      {/* SMART EVENT CREATION & EDIT MODAL (PHASES 3, 4, 5, 7, 9)        */}
      {/* ============================================================== */}
      <EventFormModal
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false)
          setEditingEventData(null)
        }}
        onSaved={() => {
          loadEvents()
          setIsEventModalOpen(false)
          setEditingEventData(null)
        }}
        initialEvent={editingEventData}
        employees={(storeState?.employees || []).map((emp) => ({
          id: emp.id || emp.employeeId || emp._id,
          name: emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.workEmail || 'Staff',
          email: emp.email || emp.workEmail || '',
          department: emp.department || '',
          role: emp.role || emp.designation || '',
          avatar: emp.avatar || null,
        }))}
        departments={
          Array.isArray(storeState?.departments)
            ? storeState.departments.map((d) => (typeof d === 'string' ? d : d.name))
            : ['All', 'Engineering', 'Human Resources', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance']
        }
        user={user}
        defaultDate={editingEventData?.date || selectedDate}
      />

      {/* ============================================================== */}
      {/* ADD / EDIT HOLIDAY MODAL                                       */}
      {/* ============================================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid var(--border, #e2e8f0)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                {isEditModalOpen ? 'Edit Holiday Record' : 'Schedule Official Company Holiday'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setIsEditModalOpen(false)
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleUpdateHoliday : handleCreateHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Field label="Holiday Name / Title *">
                <input
                  type="text"
                  required
                  placeholder="e.g. Gandhi Jayanti, Diwali, Annual Offsite"
                  value={holidayForm.name}
                  onChange={(e) => setHolidayForm({ ...holidayForm, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Start Date *">
                  <input
                    type="date"
                    required
                    value={holidayForm.date}
                    onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value, endDate: holidayForm.endDate || e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                  />
                </Field>
                <Field label="End Date (for multi-day)">
                  <input
                    type="date"
                    value={holidayForm.endDate}
                    onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Holiday Category">
                  <select
                    value={holidayForm.category}
                    onChange={(e) => setHolidayForm({ ...holidayForm, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                  >
                    {ALL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Applicable Location">
                  <input
                    type="text"
                    value={holidayForm.location}
                    onChange={(e) => setHolidayForm({ ...holidayForm, location: e.target.value })}
                    placeholder="All Locations / Ignite Campus"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                  />
                </Field>
              </div>

              <Field label="Applicable Departments (comma separated, or 'All')">
                <input
                  type="text"
                  value={Array.isArray(holidayForm.applicableDepartments) ? holidayForm.applicableDepartments.join(', ') : 'All'}
                  onChange={(e) => setHolidayForm({ ...holidayForm, applicableDepartments: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  placeholder="All or Engineering, Marketing, HR"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                />
              </Field>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={holidayForm.isPaid}
                    onChange={(e) => setHolidayForm({ ...holidayForm, isPaid: e.target.checked })}
                  />
                  <span>Paid Holiday</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={holidayForm.isRecurring}
                    onChange={(e) => setHolidayForm({ ...holidayForm, isRecurring: e.target.checked })}
                  />
                  <span>Annual Recurring Holiday</span>
                </label>
              </div>

              <Field label="Description / Observance Details">
                <textarea
                  rows={3}
                  value={holidayForm.description}
                  onChange={(e) => setHolidayForm({ ...holidayForm, description: e.target.value })}
                  placeholder="Details regarding holiday observance, offices affected, celebration rules..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                />
              </Field>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setIsEditModalOpen(false)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isEditModalOpen ? 'Save Changes' : 'Create Holiday'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DUPLICATE MODAL                                                */}
      {/* ============================================================== */}
      {isDuplicateModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 800 }}>Duplicate Holiday</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--muted, #64748b)' }}>
              Duplicate <strong>"{selectedEvent?.title}"</strong> to another year or custom date.
            </p>

            <form onSubmit={handleDuplicateHoliday} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Field label="Target Date (YYYY-MM-DD)">
                <input
                  type="date"
                  required
                  value={duplicateTargetDate}
                  onChange={(e) => setDuplicateTargetDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border, #cbd5e1)' }}
                />
              </Field>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button type="button" variant="ghost" onClick={() => setIsDuplicateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Duplicate Holiday
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL                                      */}
      {/* ============================================================== */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#b91c1c', marginBottom: '12px' }}>
              <AlertCircle size={24} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Confirm Holiday Deletion</h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--ink, #334155)', lineHeight: 1.5 }}>
              Are you sure you want to remove <strong>"{selectedEvent?.title}"</strong> on {selectedEvent?.date}? This administrative action will be recorded in the audit log.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button type="button" variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteHoliday}
                style={{ background: '#ef4444', color: '#ffffff', border: 'none' }}
              >
                Yes, Delete Holiday
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BULK CSV IMPORT MODAL                                          */}
      {/* ============================================================== */}
      {isImportModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '680px',
              background: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Bulk Import Holidays via CSV</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted, #64748b)' }}>
                  Upload a spreadsheet to bulk-register annual holidays with duplicate prevention.
                </p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <Button variant="outline" onClick={handleDownloadSampleCsv} style={{ fontSize: '12px' }}>
                <FileSpreadsheet size={14} /> Download Sample CSV Template
              </Button>
            </div>

            {/* File upload box */}
            <div
              style={{
                border: '2px dashed var(--border, #cbd5e1)',
                borderRadius: '12px',
                padding: '30px',
                textAlign: 'center',
                background: '#f8fafc',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
              onClick={() => document.getElementById('csv-file-input')?.click()}
            >
              <Upload size={32} style={{ margin: '0 auto 10px', color: 'var(--teal, #006E6F)' }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Click to select or drag and drop CSV file</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted, #94a3b8)' }}>
                Accepted columns: Holiday Name, Date, End Date, Category, Location, Departments, Paid/Unpaid, Description
              </p>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleCsvFileUpload}
              />
            </div>

            {/* Import Preview Table */}
            {importPreview && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', marginBottom: '10px', fontSize: '12px', fontWeight: 700 }}>
                  <span style={{ color: '#059669' }}>✔ {importPreview.summary?.validCount || 0} Valid Rows</span>
                  {importPreview.summary?.invalidCount > 0 && (
                    <span style={{ color: '#dc2626' }}>✖ {importPreview.summary?.invalidCount} Invalid/Duplicate Rows</span>
                  )}
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                      <tr>
                        <th style={{ padding: '6px', textAlign: 'left' }}>Status</th>
                        <th style={{ padding: '6px', textAlign: 'left' }}>Holiday Name</th>
                        <th style={{ padding: '6px', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '6px', textAlign: 'left' }}>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(importPreview.validPreview || []).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px', color: '#059669', fontWeight: 700 }}>✔ Valid</td>
                          <td style={{ padding: '6px' }}>{row.name}</td>
                          <td style={{ padding: '6px' }}>{row.date}</td>
                          <td style={{ padding: '6px' }}>{row.category}</td>
                        </tr>
                      ))}
                      {(importPreview.invalidRows || []).map((row, i) => (
                        <tr key={`inv-${i}`} style={{ borderBottom: '1px solid #fee2e2', background: '#fef2f2' }}>
                          <td style={{ padding: '6px', color: '#dc2626', fontWeight: 700 }}>✖ Error</td>
                          <td style={{ padding: '6px' }}>{row.data?.name || row.data?.['Holiday Name'] || 'Row ' + row.rowNumber}</td>
                          <td style={{ padding: '6px' }}>{row.data?.date || '-'}</td>
                          <td style={{ padding: '6px', color: '#b91c1c' }}>{row.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!importPreview || importPreview.summary?.validCount === 0 || isImporting}
                onClick={handleCommitImport}
              >
                {isImporting ? 'Importing...' : `Commit Import (${importPreview?.summary?.validCount || 0} holidays)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

