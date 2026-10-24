import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { PayslipDocument } from '../components/payroll/PayslipDocument'
import { apiClient } from '../services/apiClient'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * High-fidelity print utility for corporate A4 payslips.
 * Creates an isolated, clean iframe containing only the A4 document
 * and triggers window.print() with exact colors and zero UI modal interference.
 */
export function printPayslipDocument(record, employee, settings) {
  try {
    const markup = renderToStaticMarkup(
      <PayslipDocument
        record={record}
        employee={employee}
        settings={settings}
      />
    )

    const empName = record?.employeeName || employee?.name || 'Employee'
    const month = record?.month || 'Period'
    const title = `Payslip-${empName.replace(/\s+/g, '_')}-${month.replace(/\s+/g, '_')}`

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-9999px'
    iframe.style.top = '0'
    iframe.style.width = '210mm'
    iframe.style.height = '297mm'
    iframe.style.border = 'none'
    iframe.style.zIndex = '-99999'
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow.document
    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 8mm;
            }
            * {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .payslip-a4-sheet {
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              margin: 0 auto !important;
              padding: 8mm 10mm !important;
              box-shadow: none !important;
              transform: none !important;
            }
          </style>
        </head>
        <body>
          ${markup}
        </body>
      </html>
    `)
    doc.close()

    setTimeout(() => {
      try {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      } catch (err) {
        console.error('Print iframe execution failed:', err)
        window.print()
      }
      setTimeout(() => {
        try { document.body.removeChild(iframe) } catch {}
      }, 4000)
    }, 350)
  } catch (err) {
    console.error('Failed to generate print markup:', err)
    window.print()
  }
}

/**
 * Downloads the payslip as a genuine high-resolution A4 PDF.
 * Uses html2canvas + jsPDF client-side rendering for instant, zero-latency PDF downloads.
 * Gracefully falls back to standalone document or server endpoint if needed.
 */
export async function downloadPayslipDocument(record, employee, settings) {
  const empCode = record?.employeeId || employee?.employeeId || record?.id || 'EMP'
  const empName = record?.employeeName || employee?.name || 'Employee'
  const month = record?.month || 'Period'
  const baseFilename = `Payslip-${empCode}-${month.replace(/\s+/g, '_')}`

  // 1. Check if the payslip element is already mounted in the DOM (e.g. inside the preview modal)
  let targetElem = document.getElementById('printable-payslip-modal') || document.getElementById('printable-payslip')
  let createdTemp = false

  if (!targetElem) {
    // Mount a temporary container to render the payslip
    createdTemp = true
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'fixed'
    tempContainer.style.left = '-9999px'
    tempContainer.style.top = '0'
    tempContainer.style.width = '210mm'
    tempContainer.style.zIndex = '-99999'
    tempContainer.style.backgroundColor = '#ffffff'

    const markup = renderToStaticMarkup(
      <PayslipDocument
        record={record}
        employee={employee}
        settings={settings}
      />
    )
    tempContainer.innerHTML = markup
    document.body.appendChild(tempContainer)
    targetElem = tempContainer.querySelector('.payslip-a4-sheet') || tempContainer
  }

  try {
    // Generate high resolution canvas (scale: 2 for 300dpi clarity)
    const canvas = await html2canvas(targetElem, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1200,
    })

    if (createdTemp && targetElem?.parentNode) {
      document.body.removeChild(targetElem.parentNode)
    }

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pdfWidth = 210
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(297, pdfHeight), undefined, 'FAST')
    pdf.save(`${baseFilename}.pdf`)
    return true
  } catch (canvasErr) {
    console.warn('html2canvas/jsPDF client export failed, trying alternative:', canvasErr)
    if (createdTemp && targetElem?.parentNode) {
      try { document.body.removeChild(targetElem.parentNode) } catch {}
    }

    // Fallback: Try server endpoint if record has an ID
    const id = record?._id || record?.id
    if (id && id !== 'draft' && !String(id).startsWith('pay-')) {
      try {
        const blob = await apiClient.downloadBlob(`/payroll/${id}/pdf`)
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${baseFilename}.pdf`
        document.body.appendChild(a)
        a.click()
        setTimeout(() => {
          try { document.body.removeChild(a) } catch {}
          window.URL.revokeObjectURL(url)
        }, 500)
        return true
      } catch (serverErr) {
        console.warn('Server PDF download failed:', serverErr)
      }
    }

    // Ultimate fallback: Standalone printable HTML download
    try {
      const markup = renderToStaticMarkup(
        <PayslipDocument
          record={record}
          employee={employee}
          settings={settings}
        />
      )

      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${baseFilename}</title>
  <style>
    @page { size: A4 portrait; margin: 8mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      display: flex;
      justify-content: center;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body { padding: 0; background: #fff; }
    }
  </style>
</head>
<body>
  ${markup}
  <script>
    window.onload = function() {
      if (window.location.search.includes('print=true')) {
        window.print();
      }
    };
  </script>
</body>
</html>`

      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${baseFilename}.html`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        try { document.body.removeChild(a) } catch {}
        window.URL.revokeObjectURL(url)
      }, 500)
      return true
    } catch (err) {
      console.error('All download methods failed, falling back to print:', err)
      printPayslipDocument(record, employee, settings)
    }
  }
}
