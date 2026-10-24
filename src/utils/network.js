// Network identity helpers.
//
// Important: web browsers cannot read the connected Wi-Fi SSID or the router's
// BSSID (MAC address) — there is no such web API, for privacy reasons. The real,
// workable way to verify that a device is on the office network is the public
// (egress) IP address: every device on the same Wi-Fi/router shares the same
// public IP. So the office is registered by its public IP, and a device is
// considered "on the office network" when its public IP matches.

const IP_SERVICES = [
  { url: 'https://api.ipify.org?format=json', pick: (d) => d && d.ip },
  { url: 'https://ipapi.co/json/', pick: (d) => d && d.ip },
  { url: 'https://api.ipgeolocation.io/getip', pick: (d) => d && d.ip },
]

// Fetches the device's current public IP address, trying several providers.
// Returns the IP string, or null if none could be reached.
export async function fetchPublicIP(timeoutMs = 6000) {
  for (const service of IP_SERVICES) {
    try {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), timeoutMs)
      const response = await fetch(service.url, { signal: controller.signal, cache: 'no-store' })
      clearTimeout(timer)
      if (!response.ok) continue
      const data = await response.json()
      const ip = service.pick(data)
      if (ip) return String(ip).trim()
    } catch {
      // Try the next provider.
    }
  }
  return null
}

// Normalises an IP string for comparison (trims, lowercases IPv6, strips zone id).
export function normalizeIP(ip) {
  if (!ip) return ''
  return String(ip).trim().toLowerCase().replace(/%.*$/, '')
}
