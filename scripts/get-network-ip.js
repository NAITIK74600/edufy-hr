import os from 'node:os'

const ifaces = os.networkInterfaces()
const list = []

for (const [name, addrs] of Object.entries(ifaces)) {
  for (const item of addrs) {
    if (item.family === 'IPv4' && !item.internal) {
      list.push({ name, ip: item.address })
    }
  }
}

// Prioritize Wi-Fi and Ethernet over virtual adapters (WSL, VirtualBox, Docker)
list.sort((a, b) => {
  const aPref = /wi-?fi|ethernet|wlan|lan/i.test(a.name) ? -1 : 1
  const bPref = /wi-?fi|ethernet|wlan|lan/i.test(b.name) ? -1 : 1
  return aPref - bPref
})

if (list.length > 0) {
  console.log(`${list[0].ip} ${list[0].name}`)
} else {
  console.log('127.0.0.1 Localhost')
}
