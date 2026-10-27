import { useState, useEffect, useRef } from 'react'
import {
  Calendar,
  Upload,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Trash2,
  Download,
  X,
  Plus,
  Search,
  Filter,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { Button, StatusBadge, Field } from './ui'
import { hrStore } from '../services/hrStore'

export function HolidayCalendarShowcase({ canManage = false, user = null }) {
  const [storeState, setStoreState] = useState(() => hrStore.getState())
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [zoomScale, setZoomScale] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [notice, setNotice] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Add holiday date form (for admins)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newHolName, setNewHolName] = useState('')
  const [newHolDate, setNewHolDate] = useState('')
  const [newHolType, setNewHolType] = useState('Festival Holiday')

  const fileInputRef = useRef(null)

  useEffect(() => {
    return hrStore.subscribe((state) => setStoreState(state))
  }, [])

  const images = storeState.companySettings?.holidayCalendarImages || storeState.holidayCalendarImages || []
  const holidays = storeState.holidays || []

  // Ensure activeIndex is within bounds
  useEffect(() => {
    if (images.length > 0 && activeIndex >= images.length) {
      setActiveIndex(images.length - 1)
    }
  }, [images.length, activeIndex])

  // Reset zoom scale when changing active image or closing lightbox
  useEffect(() => {
    setZoomScale(1)
  }, [activeIndex, isLightboxOpen])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (e.key === 'ArrowRight' && images.length > 1) {
        setActiveIndex((prev) => (prev + 1) % images.length)
      }
      if (e.key === 'ArrowLeft' && images.length > 1) {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, images.length])

  // File Upload Handlers (Supports multiple images)
  const processFiles = async (files) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    const newItems = []

    const readAsDataURL = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith('image/')) continue

        const dataUrl = await readAsDataURL(file)
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        newItems.push({
          id: `cal-img-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          url: dataUrl,
          title: cleanName || `Calendar Sheet ${images.length + i + 1}`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: user?.name || user?.employeeName || 'Admin',
        })
      }

      if (newItems.length > 0) {
        hrStore.uploadHolidayCalendarImages(newItems, user?.name || 'Admin')
        setNotice(`Successfully uploaded ${newItems.length} calendar picture${newItems.length > 1 ? 's' : ''}!`)
        setActiveIndex(images.length + newItems.length - 1)
        setTimeout(() => setNotice(''), 4500)
      } else {
        setNotice('No valid image files found. Please upload JPG, PNG, or WebP images.')
        setTimeout(() => setNotice(''), 4000)
      }
    } catch (err) {
      console.error('Error processing calendar images:', err)
      setNotice('Failed to upload calendar picture. Please try again.')
      setTimeout(() => setNotice(''), 4000)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFileInputChange = (e) => {
    processFiles(e.target.files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer?.files) {
      processFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDeleteImage = (imgId, e) => {
    e?.stopPropagation()
    if (window.confirm('Are you sure you want to delete this calendar picture?')) {
      hrStore.deleteHolidayCalendarImage(imgId, user?.name || 'Admin')
      setNotice('Calendar picture removed.')
      if (activeIndex > 0) setActiveIndex(activeIndex - 1)
      setTimeout(() => setNotice(''), 3500)
    }
  }

  const handleDownload = (img, e) => {
    e?.stopPropagation()
    if (!img?.url) return
    const a = document.createElement('a')
    a.href = img.url
    a.download = `${img.title || 'company-holiday-calendar'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleAddHoliday = (e) => {
    e.preventDefault()
    if (!newHolName || !newHolDate) return
    const d = new Date(newHolDate)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const dayName = !isNaN(d.getTime()) ? days[d.getDay()] : 'Day'

    hrStore.addHoliday({
      name: newHolName,
      title: newHolName,
      date: newHolDate,
      day: dayName,
      type: newHolType,
    })

    setNotice(`Added holiday "${newHolName}" for ${newHolDate}!`)
    setNewHolName('')
    setNewHolDate('')
    setShowAddForm(false)
    setTimeout(() => setNotice(''), 3500)
  }

  const currentImage = images[activeIndex] || null

  // Filtered holidays list
  const filteredHolidays = holidays.filter((h) => {
    const name = (h.name || h.title || '').toLowerCase()
    const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || (h.date && h.date.includes(searchQuery))
    const matchesType = filterType === 'all' || (h.type && h.type.toLowerCase().includes(filterType.toLowerCase()))
    return matchesSearch && matchesType
  })

  // Calculate relative countdown for holidays
  const getDaysUntil = (dateStr) => {
    if (!dateStr) return null
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    if (isNaN(target.getTime())) return null
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return { label: 'Today', tone: 'success' }
    if (diffDays === 1) return { label: 'Tomorrow', tone: 'info' }
    if (diffDays > 1 && diffDays <= 7) return { label: `In ${diffDays} days`, tone: 'info' }
    if (diffDays > 7 && diffDays <= 30) return { label: `In ${diffDays} days`, tone: 'neutral' }
    if (diffDays > 30) return { label: `In ${diffDays} days`, tone: 'neutral' }
    return { label: 'Past', tone: 'muted' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notice */}
      {notice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 18px',
            background: '#ecfdf5',
            color: '#065f46',
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            fontSize: '13px',
            fontWeight: 600,
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{notice}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. BIG SIZE FIT-SCREEN RATIO CALENDAR SHOWCASE                */}
      {/* ============================================================== */}
      <div className="panel" style={{ padding: '24px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="eyebrow" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px', color: 'var(--teal)', fontWeight: 700 }}>
                Visual Calendar Gallery
              </span>
              <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                Fit Screen Ratio
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'var(--ink)' }}>
              Official Company Holiday Calendar
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--muted)' }}>
              Official printed schedule, festival dates, and annual company observances flyer.
            </p>
          </div>

          {/* Admin Upload Trigger */}
          {canManage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileInputChange}
              />
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
              >
                <Upload size={15} />
                <span>{isUploading ? 'Uploading Photos...' : 'Upload Calendar Pictures'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Display Container: When Images Exist */}
        {images.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* BIG FIT SCREEN RATIO DISPLAY BOX */}
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxHeight: '72vh',
                minHeight: '380px',
                aspectRatio: '16/9',
                background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                cursor: 'pointer',
              }}
              onClick={() => setIsLightboxOpen(true)}
              title="Click to view full screen (Fit Screen Mode)"
            >
              {/* The Calendar Picture - Fit Screen Ratio */}
              <img
                src={currentImage.url}
                alt={currentImage.title || 'Official Holiday Calendar'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  display: 'block',
                  userSelect: 'none',
                  transition: 'transform 0.25s ease',
                }}
              />

              {/* Top Banner Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  padding: '14px 18px',
                  background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0) 100%)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pointerEvents: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                    }}
                  >
                    Sheet {activeIndex + 1} of {images.length}
                  </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600, fontSize: '14px', textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                    {currentImage.title || `Calendar Sheet ${activeIndex + 1}`}
                  </span>
                </div>

                {/* Top Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={(e) => handleDownload(currentImage, e)}
                    title="Download high-resolution calendar image"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    title="Open Fullscreen Fit-Screen Lightbox"
                    style={{
                      background: 'rgba(255, 255, 255, 0.22)',
                      backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255, 255, 255, 0.35)',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <Maximize2 size={13} />
                    <span>Fullscreen Fit</span>
                  </button>

                  {canManage && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteImage(currentImage.id, e)}
                      title="Delete this calendar picture"
                      style={{
                        background: 'rgba(239, 68, 68, 0.25)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#fca5a5',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Floating Left/Right Arrows for Multi-picture */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
                    }}
                    title="Previous Calendar Sheet"
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      transition: 'all 0.15s ease',
                      zIndex: 2,
                    }}
                  >
                    <ChevronLeft size={22} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveIndex((prev) => (prev + 1) % images.length)
                    }}
                    title="Next Calendar Sheet"
                    style={{
                      position: 'absolute',
                      right: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      transition: 'all 0.15s ease',
                      zIndex: 2,
                    }}
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}

              {/* Bottom Subtle Indicator */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  backdropFilter: 'blur(6px)',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '11px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                }}
              >
                <Eye size={12} />
                <span>Click image for full-screen zoom and inspection</span>
              </div>
            </div>

            {/* Thumbnail Navigation Strip */}
            {images.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', padding: '6px 2px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', flexShrink: 0 }}>
                  Sheets ({images.length}):
                </span>
                {images.map((img, idx) => {
                  const isActive = idx === activeIndex
                  return (
                    <div
                      key={img.id || idx}
                      onClick={() => setActiveIndex(idx)}
                      style={{
                        position: 'relative',
                        width: '88px',
                        height: '56px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        flexShrink: 0,
                        border: isActive ? '2px solid var(--teal)' : '1px solid var(--line)',
                        boxShadow: isActive ? '0 0 0 2px rgba(13, 148, 136, 0.3)' : 'none',
                        background: '#0f172a',
                        transition: 'all 0.15s ease',
                      }}
                      title={img.title || `Sheet ${idx + 1}`}
                    >
                      <img
                        src={img.url}
                        alt={`Thumb ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: isActive ? 1 : 0.65,
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: '1px 4px',
                          background: 'rgba(15, 23, 42, 0.8)',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontWeight: 700,
                          textAlign: 'center',
                        }}
                      >
                        Sheet {idx + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          /* Empty State: No Calendar Images Uploaded Yet */
          <div
            onDrop={canManage ? handleDrop : undefined}
            onDragOver={canManage ? handleDragOver : undefined}
            onDragLeave={canManage ? handleDragLeave : undefined}
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              background: isDragging ? '#f0fdfa' : '#f8fafc',
              borderRadius: '12px',
              border: isDragging ? '2px dashed var(--teal)' : '2px dashed var(--line)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
              }}
            >
              <Calendar size={32} />
            </div>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                {canManage ? 'Upload Official Company Holiday Calendar' : 'Official Calendar Flyer Pending'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)', maxWidth: '480px' }}>
                {canManage
                  ? 'Upload multiple pictures of the official holiday calendar poster, scanned sheets, or company flyers. They will display here in big fit-screen ratio for all employees.'
                  : 'Official graphical holiday calendar flyers will appear here once published by HR / Admin. In the meantime, browse the complete schedule below.'}
              </p>
            </div>

            {canManage && (
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Upload size={14} />
                <span>Select & Upload Calendar Photos</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. FULLSCREEN FIT-SCREEN LIGHTBOX MODAL                        */}
      {/* ============================================================== */}
      {isLightboxOpen && currentImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(10, 15, 29, 0.94)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px 24px',
          }}
          onClick={() => setIsLightboxOpen(false)}
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
                Sheet {activeIndex + 1} of {images.length}
              </span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 600 }}>
                {currentImage.title || `Holiday Calendar Sheet ${activeIndex + 1}`}
              </span>
              {currentImage.uploadedAt && (
                <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                  Uploaded on {currentImage.uploadedAt}
                </span>
              )}
            </div>

            {/* Lightbox Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Zoom Controls */}
              <button
                type="button"
                onClick={() => setZoomScale((s) => Math.max(0.7, s - 0.25))}
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
              <span style={{ color: '#ffffff', fontSize: '12px', minWidth: '45px', textAlign: 'center' }}>
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
                onClick={(e) => handleDownload(currentImage, e)}
                title="Download Original High-Res Image"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
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
                <span>Save</span>
              </button>

              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                title="Close Fullscreen (Esc)"
                style={{
                  background: 'rgba(239, 68, 68, 0.3)',
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
              src={currentImage.url}
              alt={currentImage.title || 'Official Holiday Calendar Fullscreen'}
              style={{
                maxWidth: '96vw',
                maxHeight: '84vh',
                objectFit: 'contain',
                transform: `scale(${zoomScale})`,
                transition: 'transform 0.15s ease-out',
                borderRadius: '8px',
                boxShadow: '0 20px 35px rgba(0, 0, 0, 0.5)',
              }}
            />

            {/* Left / Right Nav in Lightbox */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                  title="Previous sheet"
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
                  onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                  title="Next sheet"
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

          {/* Lightbox Footer Thumbnail Row */}
          {images.length > 1 && (
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
              {images.map((img, idx) => {
                const isActive = idx === activeIndex
                return (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
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
      {/* 3. STRUCTURED HOLIDAY SCHEDULE TABLE / CARDS                   */}
      {/* ============================================================== */}
      <div className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: 'var(--ink)' }}>
              Official Holiday Schedule List ({holidays.length} Days)
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
              Searchable catalog of national observances, regional festivals, and mandatory corporate holidays.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                className="text-input"
                placeholder="Search holiday or date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', width: '100%', fontSize: '12px' }}
              />
            </div>

            {/* Filter by Type */}
            <select
              className="text-input"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ width: '150px', fontSize: '12px' }}
            >
              <option value="all">All Holiday Types</option>
              <option value="national">National Holiday</option>
              <option value="festival">Festival Holiday</option>
              <option value="company">Company Holiday</option>
              <option value="gazetted">Gazetted Holiday</option>
              <option value="optional">Optional Holiday</option>
            </select>

            {/* Admin Add Holiday Date Button */}
            {canManage && (
              <Button
                variant={showAddForm ? 'secondary' : 'primary'}
                onClick={() => setShowAddForm(!showAddForm)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
              >
                {showAddForm ? <X size={13} /> : <Plus size={13} />}
                <span>{showAddForm ? 'Cancel' : 'Add Holiday Date'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Admin Add Holiday Inline Form */}
        {showAddForm && canManage && (
          <form
            onSubmit={handleAddHoliday}
            style={{
              padding: '16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Holiday Name *
              </label>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Eid-ul-Fitr, Independence Day"
                value={newHolName}
                onChange={(e) => setNewHolName(e.target.value)}
                style={{ width: '100%', fontSize: '12px' }}
                required
              />
            </div>

            <div style={{ width: '160px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Date *
              </label>
              <input
                type="date"
                className="text-input"
                value={newHolDate}
                onChange={(e) => setNewHolDate(e.target.value)}
                style={{ width: '100%', fontSize: '12px' }}
                required
              />
            </div>

            <div style={{ width: '180px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Category
              </label>
              <select
                className="text-input"
                value={newHolType}
                onChange={(e) => setNewHolType(e.target.value)}
                style={{ width: '100%', fontSize: '12px' }}
              >
                <option value="National Holiday">National Holiday</option>
                <option value="Festival Holiday">Festival Holiday</option>
                <option value="Company Holiday">Company Holiday</option>
                <option value="Gazetted Holiday">Gazetted Holiday</option>
                <option value="Optional Holiday">Optional Holiday</option>
              </select>
            </div>

            <Button type="submit" variant="primary" style={{ padding: '8px 16px', fontSize: '12px' }}>
              Save Holiday
            </Button>
          </form>
        )}

        {/* Holidays Card Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {filteredHolidays.map((h, i) => {
            const countdown = getDaysUntil(h.date)
            return (
              <div
                key={h.id || h._id || i}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: '#ffffff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: '#f0fdfa',
                        color: 'var(--teal)',
                      }}
                    >
                      {h.type || 'Holiday'}
                    </span>
                    {countdown && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: countdown.tone === 'success' ? '#dcfce7' : countdown.tone === 'info' ? '#e0f2fe' : '#f1f5f9',
                          color: countdown.tone === 'success' ? '#166534' : countdown.tone === 'info' ? '#0369a1' : '#64748b',
                        }}
                      >
                        {countdown.label}
                      </span>
                    )}
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                    {h.name || h.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--teal)' }}>{h.date}</span>
                    <span>·</span>
                    <span>{h.day || 'Company Holiday'}</span>
                  </div>
                </div>

                {canManage && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete holiday "${h.name || h.title}"?`)) {
                          hrStore.deleteHoliday(h.id || h._id || h.name || h.title)
                          setNotice(`Removed holiday "${h.name || h.title}"!`)
                          setTimeout(() => setNotice(''), 3500)
                        }
                      }}
                      title="Delete holiday"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                      }}
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filteredHolidays.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--muted)', fontSize: '13px' }}>
            No holidays found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  )
}
