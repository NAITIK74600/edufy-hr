import fs from 'node:fs'

let content = fs.readFileSync('src/pages/LoginPage.jsx', 'utf8')
let contentNorm = content.replace(/\r\n/g, '\n')

const targetLogin = `      if (loggedUser?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (loggedUser?.role === 'hr') {
        window.location.hash = '#/hr'
      } else {
        throw new Error('Access denied: Employee accounts cannot sign into the HR or Admin Management Console.')
      }`

const replLogin = `      if (loggedUser?.role === 'admin') {
        window.location.hash = '#/admin'
      } else if (['hr', 'director', 'managing_director', 'co_founder', 'vertical_head'].includes(loggedUser?.role)) {
        window.location.hash = '#/hr'
      } else {
        throw new Error('Access denied: Employee accounts cannot sign into the HR or Admin Management Console.')
      }`

if (contentNorm.includes(targetLogin)) {
  contentNorm = contentNorm.replace(targetLogin, replLogin)
  if (content.includes('\r\n')) contentNorm = contentNorm.replace(/\n/g, '\r\n')
  fs.writeFileSync('src/pages/LoginPage.jsx', contentNorm, 'utf8')
  console.log('Successfully updated LoginPage.jsx')
} else {
  console.error('Target not found in LoginPage.jsx')
}

