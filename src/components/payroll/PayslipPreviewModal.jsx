import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PayslipDocument } from './PayslipDocument'
import { apiClient } from '../../services/apiClient'
import { printPayslipDocument, downloadPayslipDocument } from '../../utils/payslipExport'
import { X, Printer, Download, Mail, ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react'

const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#D4E1E2',
  fontSize: '11px',
  cursor: 'pointer',
  padding: '4px 6px',
  borderRadius: '4px',
  display: 'inline-flex',
  alignItems: 'center',
}

const actionBtnStyle = {
  border: 'none',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  padding: '6px 14px',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
}

export function PayslipPreviewModal({
  record,
  employee,
  settings,
  onClose,
  canEmail = false,
}) {
  const [zoom, setZoom] = useState(100)
  const [downloading, setDownloading] = useState(false)
  const [emailing, setEmailing] = useState(false)
  const [emailNotice, setEmailNotice] = useState(null)

  // Prevent background scrolling when preview modal is open
  useEffect(() => {
    if (typeof document === 'undefined') return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const empName = record?.employeeName || employee?.name || 'Employee'
  const month = record?.month || 'Period'

  const handlePrint = () => {
    printPayslipDocument(record, employee, settings)
  }

  const handleDownloadPdf = async () => {
    setDownloading(true)
    try {
      await downloadPayslipDocument(record, employee, settings)
    } catch (err) {
      console.error('Download failed, using print dialog:', err)
      printPayslipDocument(record, employee, settings)
    } finally {
      setDownloading(false)
    }
  }

  const handleEmail = async () => {
    if (!record?.id && !record?._id) {
      setEmailNotice('Please save the payslip draft first before sending via email.')
      return
    }
    setEmailing(true)
    setEmailNotice(null)
    try {
      const id = record.id || record._id
      const res = await apiClient.post(`/payroll/${id}/email`)
      setEmailNotice(res?.data?.message || 'Payslip emailed successfully!')
    } catch (err) {
      setEmailNotice(err.message || 'Failed to email payslip. Check email configuration.')
    } finally {
      setEmailing(false)
    }
  }

  const modalNode = (
    <div
      className="payslip-preview-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647, // Maximum integer z-index so it is always above all headers, sidebars, and layouts
        backgroundColor: 'rgba(11, 23, 39, 0.85)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        flexDirection: 'column',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
      onClick={onClose}
    >
      {/* Top Navigation Bar with Single Close Button */}
      <header
        className="payslip-modal-toolbar"
        style={{
          flex: '0 0 auto',
          position: 'sticky',
          top: 0,
          zIndex: 2147483646,
          backgroundColor: '#002D33',
          color: '#ffffff',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 3px 14px rgba(0,0,0,0.3)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Document Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(45, 212, 191, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2dd4bf',
            }}
          >
            <FileText size={18} />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#F4FCFC', letterSpacing: '-0.2px' }}>
              Payslip Voucher: {empName}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {month} · Official A4 Corporate Document
            </div>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.08)',
            padding: '4px 10px',
            borderRadius: '6px',
          }}
        >
          <button
            type="button"
            style={btnStyle}
            onClick={() => setZoom((z) => Math.max(50, z - 10))}
            title="Zoom Out"
          >
            <ZoomOut size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            Zoom -
          </button>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              minWidth: '45px',
              textAlign: 'center',
              color: '#F4FCFC',
            }}
          >
            {zoom}%
          </span>
          <button
            type="button"
            style={btnStyle}
            onClick={() => setZoom((z) => Math.min(150, z + 10))}
            title="Zoom In"
          >
            <ZoomIn size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            Zoom +
          </button>
          <button
            type="button"
            style={{ ...btnStyle, opacity: zoom === 100 ? 0.7 : 1 }}
            onClick={() => setZoom(100)}
            title="Reset to 100%"
          >
            <RotateCcw size={12} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
            Fit 100%
          </button>
        </div>

        {/* Right: Actions + Single Unified Navbar Close Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {canEmail && (
            <button
              type="button"
              style={{ ...actionBtnStyle, background: '#006E6F' }}
              onClick={handleEmail}
              disabled={emailing}
            >
              <Mail size={14} />
              {emailing ? 'Sending...' : 'Email'}
            </button>
          )}

          <button
            type="button"
            style={{ ...actionBtnStyle, background: downloading ? '#586D72' : '#006E6F' }}
            onClick={handleDownloadPdf}
            disabled={downloading}
          >
            <Download size={14} />
            {downloading ? 'Generating PDF...' : 'Download PDF'}
          </button>

          <button
            type="button"
            style={{ ...actionBtnStyle, background: '#F0A13E', color: '#0A2328' }}
            onClick={handlePrint}
          >
            <Printer size={14} />
            Print
          </button>

          {/* ONE PROMINENT CLOSE BUTTON IN NAVBAR */}
          <button
            type="button"
            style={{
              ...actionBtnStyle,
              background: '#dc2626',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '7px 18px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(220,38,38,0.4)',
              marginLeft: '4px',
            }}
            onClick={onClose}
            title="Close (Esc)"
          >
            <X size={16} strokeWidth={2.5} />
            Close
          </button>
        </div>
      </header>

      {emailNotice && (
        <div
          style={{
            background: '#006E6F',
            color: '#F4FCFC',
            padding: '8px 20px',
            fontSize: '12px',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {emailNotice}
        </div>
      )}

      {/* Sheet Viewport */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '28px 16px 80px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#0f172a',
          WebkitOverflowScrolling: 'touch',
        }}
        onClick={onClose}
      >
        {/* Printable A4 Payslip Sheet */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            margin: '0 auto',
          }}
        >
          <PayslipDocument
            id="printable-payslip-modal"
            record={record}
            employee={employee}
            settings={settings}
            scale={1}
          />
        </div>
      </div>
    </div>
  )

  // Portal to document.body ensures the modal is never trapped inside transformed layout elements
  return typeof document !== 'undefined'
    ? createPortal(modalNode, document.body)
    : modalNode
}

export default PayslipPreviewModal
