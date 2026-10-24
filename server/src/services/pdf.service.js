import { generatePayslipHtml } from './payslip.service.js'

export async function generatePayslipPdf(formattedData) {
  const html = generatePayslipHtml(formattedData)

  // Try dynamic import of puppeteer if installed in environment
  try {
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '12mm', right: '12mm' },
    })
    await browser.close()
    return { buffer: pdfBuffer, contentType: 'application/pdf', filename: `Payslip-${formattedData.employeeCode}-${formattedData.payrollMonth.replace(/\s+/g, '_')}.pdf` }
  } catch (err) {
    // Graceful fallback: return self-printing print-optimized document
    const printableHtml = html.replace('</body>', '<script>window.onload = function(){ if(window.location.search.includes("print=true")){ window.print(); } };</script></body>')
    return {
      buffer: Buffer.from(printableHtml, 'utf8'),
      contentType: 'text/html; charset=utf-8',
      filename: `Payslip-${formattedData.employeeCode}-${formattedData.payrollMonth.replace(/\s+/g, '_')}.html`,
    }
  }
}

export default {
  generatePayslipPdf,
}
