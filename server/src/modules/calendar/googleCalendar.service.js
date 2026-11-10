import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { CalendarIntegration } from '../../models/CalendarIntegration.js'
import { GoogleIntegration } from '../../models/GoogleIntegration.js'
import { encryptToken, decryptToken } from '../../utils/encryption.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Production Google Calendar & Google Meet Integration Service
 * - Handles OAuth 2.0 flow with AES-256-GCM encrypted token storage
 * - Automatic access-token refreshing with expiry buffer
 * - Exponential backoff retry logic for Google Calendar REST APIs
 * - Verified Google Meet conferenceData generation (ZERO fake links)
 * - Synchronizes creations, updates, and cancellations
 * - Cryptographically signed OAuth state with replay protection
 */

// In-memory OAuth state registry (10-minute TTL, single-use per authorization attempt)
const activeOAuthStates = new Map()

// Clean up expired states every 5 minutes
const stateCleanerInterval = setInterval(() => {
  const now = Date.now()
  for (const [nonce, data] of activeOAuthStates.entries()) {
    if (data.expiresAt < now) {
      activeOAuthStates.delete(nonce)
    }
  }
}, 5 * 60 * 1000)
if (stateCleanerInterval.unref) stateCleanerInterval.unref()

let envLoadAttempted = false
function ensureEnvLoaded() {
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    return
  }
  envLoadAttempted = true

  const candidatePaths = [
    path.resolve(__dirname, '../../../../.env'),
    path.resolve(__dirname, '../../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '..', '.env'),
    '/home/admin_edufytech/EDUFYIONE/.env',
    '/home/admin_edufytech/edufyione/.env',
  ]

  for (const envPath of candidatePaths) {
    try {
      if (fs.existsSync(envPath)) {
        const raw = fs.readFileSync(envPath, 'utf8')
        for (const rawLine of raw.split('\n')) {
          const line = rawLine.trim()
          if (line && !line.startsWith('#') && line.includes('=')) {
            const idx = line.indexOf('=')
            const k = line.slice(0, idx).trim()
            let v = line.slice(idx + 1).trim()
            if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
              v = v.slice(1, -1).trim()
            }
            if (k && (!process.env[k] || process.env[k].trim() === '')) {
              process.env[k] = v
            }
          }
        }
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) break
      }
    } catch {}
  }
}

/**
 * Helper: Run an async fetch with exponential backoff retry for transient network/quota errors (429, 503)
 */
async function fetchWithRetry(url, options, maxRetries = 2) {
  let attempt = 0
  let delay = 500

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, options)
      if (response.status === 429 || (response.status >= 500 && response.status <= 504)) {
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay))
          delay *= 2
          attempt++
          continue
        }
      }
      return response
    } catch (err) {
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay))
        delay *= 2
        attempt++
        continue
      }
      throw err
    }
  }
}

export const googleCalendarService = {
  /**
   * Get server-side Google OAuth client configuration strictly from environment variables
   */
  getClientConfig() {
    ensureEnvLoaded()

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim() || ''
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() || ''
    const redirectUri = (process.env.GOOGLE_REDIRECT_URI?.trim() || 'https://edufyione.edufyitech.in/api/v1/calendar/google/callback').replace(/\/+$/, '')
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY?.trim() || ''
    const projectId = process.env.GOOGLE_PROJECT_ID?.trim() || 'hr-ed-514310'

    return {
      clientId,
      clientSecret,
      redirectUri,
      apiKey,
      projectId,
    }
  },

  /**
   * Check if Google OAuth client credentials are genuinely configured in server environment
   */
  isConfigured() {
    const { clientId, clientSecret } = this.getClientConfig()
    return Boolean(clientId && clientSecret)
  },

  /**
   * Generate cryptographically signed, user-bound OAuth state token with replay protection
   */
  generateOAuthState(user = null) {
    const nonce = crypto.randomBytes(24).toString('hex')
    const timestamp = Date.now()
    const expiresAt = timestamp + 10 * 60 * 1000 // 10 minutes TTL
    const userId = String(user?.id || user?._id || 'admin')
    const userEmail = user?.email || ''
    const userName = user?.displayName || user?.name || 'Administrator'

    const stateData = {
      nonce,
      userId,
      userEmail,
      userName,
      expiresAt,
    }

    const signingKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || 'edufyi-oauth-state-secret'
    const payloadBase64 = Buffer.from(JSON.stringify(stateData)).toString('base64url')
    const signature = crypto.createHmac('sha256', signingKey).update(payloadBase64).digest('base64url')
    const stateString = `${payloadBase64}.${signature}`

    activeOAuthStates.set(nonce, stateData)
    return stateString
  },

  /**
   * Validate and consume OAuth state token (one-time use, prevents replay attacks)
   */
  validateAndConsumeOAuthState(stateString) {
    if (!stateString || typeof stateString !== 'string') {
      return { valid: false, reason: 'Missing state parameter.' }
    }

    const parts = stateString.split('.')
    if (parts.length !== 2) {
      return { valid: false, reason: 'Malformed state parameter format.' }
    }

    const [payloadBase64, providedSig] = parts
    const signingKey = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY || process.env.JWT_SECRET || 'edufyi-oauth-state-secret'
    const expectedSig = crypto.createHmac('sha256', signingKey).update(payloadBase64).digest('base64url')

    const bufProvided = Buffer.from(providedSig)
    const bufExpected = Buffer.from(expectedSig)

    if (bufProvided.length !== bufExpected.length || !crypto.timingSafeEqual(bufProvided, bufExpected)) {
      return { valid: false, reason: 'Invalid state signature. Potential CSRF or tampering attempt.' }
    }

    let stateData
    try {
      stateData = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'))
    } catch {
      return { valid: false, reason: 'Invalid state payload encoding.' }
    }

    if (Date.now() > stateData.expiresAt) {
      activeOAuthStates.delete(stateData.nonce)
      return { valid: false, reason: 'OAuth session state has expired (10-minute limit). Please initiate connection again.' }
    }

    if (!activeOAuthStates.has(stateData.nonce)) {
      return { valid: false, reason: 'OAuth state already consumed or not recognized. Replay protection triggered.' }
    }

    // Single-use: Consume state immediately
    activeOAuthStates.delete(stateData.nonce)
    return { valid: true, stateData }
  },

  /**
   * Generate secure Google OAuth 2.0 authorization URL pointing to canonical callback
   */
  getAuthUrl(user = null) {
    if (!this.isConfigured()) return null
    const { clientId, redirectUri } = this.getClientConfig()
    const state = this.generateOAuthState(user)

    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ')

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state,
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  },

  /**
   * Exchange Google authorization code for access and refresh tokens
   */
  async exchangeCodeForTokens(code, actor = null, redirectUriOverride = null) {
    if (!this.isConfigured()) {
      throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) not configured in server environment.')
    }

    const { clientId, clientSecret, redirectUri } = this.getClientConfig()
    const effectiveUri = redirectUriOverride || redirectUri

    const candidateRedirectUris = Array.from(new Set([
      effectiveUri ? effectiveUri.replace(/\/+$/, '') : '',
      effectiveUri ? (effectiveUri.replace(/\/+$/, '') + '/') : '',
      redirectUri ? redirectUri.replace(/\/+$/, '') : '',
      'https://edufyione.edufyitech.in/api/v1/calendar/google/callback',
      'https://edufyione.edufyitech.in',
      'https://edufyione.edufyitech.in/',
    ].filter(Boolean)))

    let tokenData = null
    let lastError = null

    for (const uri of candidateRedirectUris) {
      try {
        const res = await fetchWithRetry('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: uri,
            grant_type: 'authorization_code',
          }),
        })
        const data = await res.json()
        if (res.ok && data.access_token) {
          tokenData = data
          break
        } else {
          lastError = data.error_description || data.error || 'Failed to exchange authorization code.'
          if (data.error !== 'redirect_uri_mismatch') {
            break
          }
        }
      } catch (err) {
        lastError = err.message
      }
    }

    if (!tokenData || !tokenData.access_token) {
      throw new Error(lastError || 'Failed to exchange authorization code for Google tokens.')
    }

    // Retrieve verified account email from Google UserInfo endpoint
    let accountEmail = ''
    try {
      const userRes = await fetchWithRetry('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      })
      if (userRes.ok) {
        const userInfo = await userRes.json()
        accountEmail = userInfo.email || ''
      }
    } catch (e) {
      console.warn('[GoogleCalendar OAuth]: UserInfo lookup notice:', e.message)
    }

    const tokenExpiry = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000)
    const scopesList = (tokenData.scope || '').split(' ')

    // Encrypt sensitive tokens using AES-256-GCM before database persistence
    const encryptedAccessToken = encryptToken(tokenData.access_token)
    const encryptedRefreshToken = tokenData.refresh_token ? encryptToken(tokenData.refresh_token) : null

    // Fetch existing integration to retain refresh token if not returned on re-auth
    let existingRefreshToken = null
    const existing = await CalendarIntegration.findOne({ provider: 'google' })
    if (existing?.encryptedRefreshToken) {
      existingRefreshToken = existing.encryptedRefreshToken
    }

    const finalEncryptedRefreshToken = encryptedRefreshToken || existingRefreshToken

    // 1. Upsert CalendarIntegration (backward-compatible)
    const integration = await CalendarIntegration.findOneAndUpdate(
      { provider: 'google' },
      {
        provider: 'google',
        isConnected: true,
        connectedBy: actor?.id || actor?._id || 'admin',
        connectedByName: actor?.name || 'Administrator',
        connectedAt: new Date(),
        accountEmail,
        encryptedAccessToken,
        encryptedRefreshToken: finalEncryptedRefreshToken,
        tokenExpiry,
        scopes: scopesList,
        lastSyncAt: new Date(),
        syncStatus: 'active',
        lastError: null,
      },
      { upsert: true, new: true, returnDocument: 'after' }
    )

    // 2. Upsert GoogleIntegration
    await GoogleIntegration.findOneAndUpdate(
      { organizationId: 'default_org' },
      {
        organizationId: 'default_org',
        accountEmail,
        encryptedAccessToken,
        encryptedRefreshToken: finalEncryptedRefreshToken,
        tokenExpiry,
        scopes: scopesList,
        isConnected: true,
        connectionStatus: 'active',
        lastSyncAt: new Date(),
        lastError: null,
        connectedBy: actor?.id || actor?._id || 'admin',
        connectedByName: actor?.name || 'Administrator',
      },
      { upsert: true }
    ).catch(() => {})

    return integration
  },

  /**
   * Retrieves a valid, decrypted access token, automatically refreshing if expired
   */
  async getValidAccessToken() {
    const integration = await CalendarIntegration.findOne({ provider: 'google', isConnected: true })
    if (!integration || !integration.encryptedAccessToken) {
      return null
    }

    // 1. Check expiration with a 2-minute safety window
    const now = new Date()
    if (integration.tokenExpiry && integration.tokenExpiry.getTime() - now.getTime() > 120000) {
      const decrypted = decryptToken(integration.encryptedAccessToken)
      if (decrypted) return decrypted
    }

    // 2. Token expired or expiring soon; refresh using encryptedRefreshToken
    if (!integration.encryptedRefreshToken) {
      const currentToken = decryptToken(integration.encryptedAccessToken)
      return currentToken
    }

    const refreshTokenPlain = decryptToken(integration.encryptedRefreshToken)
    if (!refreshTokenPlain) {
      console.error('[GoogleCalendar Error]: Could not decrypt refresh token.')
      return null
    }

    const { clientId, clientSecret } = this.getClientConfig()
    if (!clientId || !clientSecret) return decryptToken(integration.encryptedAccessToken)

    try {
      let refreshed = null
      const res = await fetchWithRetry('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: refreshTokenPlain,
          grant_type: 'refresh_token',
        }),
      })
      const data = await res.json()
      if (res.ok && data.access_token) {
        refreshed = data
      } else {
        refreshed = data
      }

      if (refreshed?.access_token) {
        integration.encryptedAccessToken = encryptToken(refreshed.access_token)
        integration.tokenExpiry = new Date(Date.now() + (refreshed.expires_in || 3600) * 1000)
        integration.syncStatus = 'active'
        integration.lastError = null
        await integration.save()

        await GoogleIntegration.updateOne(
          { organizationId: 'default_org' },
          {
            encryptedAccessToken: integration.encryptedAccessToken,
            tokenExpiry: integration.tokenExpiry,
            connectionStatus: 'active',
            lastError: null,
          }
        ).catch(() => {})

        return refreshed.access_token
      } else {
        const errDetail = refreshed.error_description || refreshed.error || 'Token refresh failed.'
        integration.syncStatus = 'error'
        integration.lastError = errDetail
        if (refreshed.error === 'invalid_grant') {
          integration.syncStatus = 'revoked'
          integration.isConnected = false
        }
        await integration.save()
      }
    } catch (err) {
      console.warn('[GoogleCalendar Refresh Token Notice]:', err.message)
    }

    return decryptToken(integration.encryptedAccessToken)
  },

  /**
   * Create Google Calendar Event with Genuine Google Meet conferenceData (Zero fake fallbacks)
   */
  async createGoogleMeetEvent(eventData) {
    const accessToken = await this.getValidAccessToken()

    if (!accessToken) {
      return {
        success: false,
        googleEventId: null,
        url: null,
        meetCode: null,
        conferenceId: null,
        conferenceStatus: 'failed',
        error: 'Google Workspace account is not connected. Please connect your organization Google account in Google Settings.',
        provider: 'none',
      }
    }

    try {
      const requestId = crypto.randomUUID()
      const timezone = eventData.timezone || 'Asia/Kolkata'

      const startDateTime = eventData.allDay
        ? { date: eventData.date }
        : { dateTime: `${eventData.date}T${eventData.startTime || '10:00'}:00`, timeZone: timezone }
      const endDateTime = eventData.allDay
        ? { date: eventData.endDate || eventData.date }
        : { dateTime: `${eventData.endDate || eventData.date}T${eventData.endTime || '11:00'}:00`, timeZone: timezone }

      const attendees = (eventData.attendees || eventData.participants || [])
        .filter((p) => p.email && p.email.includes('@'))
        .map((p) => ({ email: p.email, displayName: p.name }))

      const googleEventPayload = {
        summary: eventData.title,
        description: eventData.description || 'Edufyi One Smart Meeting & Video Conference',
        start: startDateTime,
        end: endDateTime,
        attendees: attendees.length > 0 ? attendees : undefined,
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }

      if (eventData.location?.name || eventData.location?.address) {
        googleEventPayload.location = eventData.location.formattedAddress || eventData.location.address || eventData.location.name
      }

      const res = await fetchWithRetry('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleEventPayload),
      })

      const created = await res.json()

      if (res.ok && created.id) {
        const createStatus = created.conferenceData?.createRequest?.status?.statusCode || 'success'
        const entryPoint = (created.conferenceData?.entryPoints || []).find((ep) => ep.entryPointType === 'video')
        const meetUrl = entryPoint?.uri || created.hangoutLink || ''
        const meetCode = meetUrl ? meetUrl.replace(/^https?:\/\/meet\.google\.com\//i, '') : ''

        return {
          success: true,
          googleEventId: created.id,
          url: meetUrl || null,
          meetCode: meetCode || null,
          provider: meetUrl ? 'google_meet' : 'none',
          conferenceId: created.conferenceData?.conferenceId || null,
          conferenceStatus: meetUrl ? 'confirmed' : createStatus === 'pending' ? 'pending' : 'failed',
          htmlLink: created.htmlLink || null,
          autoGenerated: true,
        }
      } else {
        const errorMsg = created.error?.message || 'Google Calendar API conference creation rejected.'
        console.warn('[GoogleCalendar Create API Error]:', errorMsg)
        return {
          success: false,
          googleEventId: null,
          url: null,
          meetCode: null,
          conferenceStatus: 'failed',
          error: errorMsg,
          provider: 'none',
        }
      }
    } catch (err) {
      console.warn('[GoogleCalendar Meet Event Notice]:', err.message)
      return {
        success: false,
        googleEventId: null,
        url: null,
        meetCode: null,
        conferenceStatus: 'failed',
        error: err.message,
        provider: 'none',
      }
    }
  },

  /**
   * Update existing event on Google Calendar
   */
  async updateGoogleEvent(googleEventId, eventData) {
    if (!googleEventId) return null
    const accessToken = await this.getValidAccessToken()
    if (!accessToken) return null

    try {
      const timezone = eventData.timezone || 'Asia/Kolkata'
      const startDateTime = eventData.allDay
        ? { date: eventData.date }
        : { dateTime: `${eventData.date}T${eventData.startTime || '10:00'}:00`, timeZone: timezone }
      const endDateTime = eventData.allDay
        ? { date: eventData.endDate || eventData.date }
        : { dateTime: `${eventData.endDate || eventData.date}T${eventData.endTime || '11:00'}:00`, timeZone: timezone }

      const attendees = (eventData.attendees || eventData.participants || [])
        .filter((p) => p.email && p.email.includes('@'))
        .map((p) => ({ email: p.email, displayName: p.name }))

      const googlePatchPayload = {
        summary: eventData.title,
        description: eventData.description || 'Edufyi One Smart Meeting',
        start: startDateTime,
        end: endDateTime,
        attendees: attendees.length > 0 ? attendees : undefined,
      }

      if (eventData.location?.name || eventData.location?.address) {
        googlePatchPayload.location = eventData.location.formattedAddress || eventData.location.address || eventData.location.name
      }

      const res = await fetchWithRetry(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(googleEventId)}?conferenceDataVersion=1`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googlePatchPayload),
      })

      const updated = await res.json()
      if (res.ok && updated.id) {
        const entryPoint = (updated.conferenceData?.entryPoints || []).find((ep) => ep.entryPointType === 'video')
        const meetUrl = entryPoint?.uri || updated.hangoutLink || ''
        const meetCode = meetUrl ? meetUrl.replace(/^https?:\/\/meet\.google\.com\//i, '') : ''
        return {
          success: true,
          googleEventId: updated.id,
          url: meetUrl,
          meetCode,
          conferenceStatus: meetUrl ? 'confirmed' : 'none',
          htmlLink: updated.htmlLink || null,
        }
      }
    } catch (err) {
      console.warn('[GoogleCalendar Update API Notice]:', err.message)
    }
    return null
  },

  /**
   * Delete or cancel an event on Google Calendar
   */
  async deleteGoogleEvent(googleEventId) {
    if (!googleEventId) return true
    const accessToken = await this.getValidAccessToken()
    if (!accessToken) return false

    try {
      const res = await fetchWithRetry(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(googleEventId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return res.ok || res.status === 404 || res.status === 410 // Consider already-deleted as success
    } catch (err) {
      console.warn('[GoogleCalendar Delete Notice]:', err.message)
      return false
    }
  },

  /**
   * Fetch events from Google Calendar within a specific time boundary
   */
  async fetchGoogleEvents({ timeMin, timeMax, maxResults = 50 } = {}) {
    const accessToken = await this.getValidAccessToken()
    if (!accessToken) return []

    try {
      const params = new URLSearchParams({
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: String(maxResults),
      })
      if (timeMin) params.set('timeMin', new Date(timeMin).toISOString())
      if (timeMax) params.set('timeMax', new Date(timeMax).toISOString())

      const res = await fetchWithRetry(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        const data = await res.json()
        return data.items || []
      }
    } catch (err) {
      console.warn('[GoogleCalendar Fetch Events Notice]:', err.message)
    }
    return []
  },

  /**
   * Disconnect Google Workspace Integration safely
   */
  async disconnect() {
    await CalendarIntegration.findOneAndUpdate(
      { provider: 'google' },
      {
        isConnected: false,
        encryptedAccessToken: null,
        encryptedRefreshToken: null,
        syncStatus: 'disconnected',
        lastError: null,
      }
    )
    await GoogleIntegration.findOneAndUpdate(
      { organizationId: 'default_org' },
      {
        isConnected: false,
        encryptedAccessToken: null,
        encryptedRefreshToken: null,
        connectionStatus: 'disconnected',
        lastError: null,
      }
    ).catch(() => {})

    return { success: true, message: 'Google account disconnected successfully.' }
  },

  /**
   * Retrieve safe public integration status (never returning secrets or encrypted tokens)
   */
  async getIntegrationStatus() {
    const isConfig = this.isConfigured()
    const { redirectUri, projectId } = this.getClientConfig()
    const integration = await CalendarIntegration.findOne({ provider: 'google' }).lean().catch(() => null)
    const isConn = Boolean(integration?.isConnected && integration?.encryptedAccessToken)
    return {
      provider: 'google',
      isConfigured: isConfig,
      googleConfigured: isConfig,
      isConnected: isConn,
      connected: isConn,
      accountEmail: integration?.accountEmail || null,
      connectedBy: integration?.connectedByName || integration?.connectedBy || null,
      connectedAt: integration?.connectedAt || null,
      lastSyncAt: integration?.lastSyncAt || null,
      syncStatus: integration?.syncStatus || (isConn ? 'active' : 'disconnected'),
      scopes: integration?.scopes || [],
      expired: integration?.tokenExpiry ? new Date(integration.tokenExpiry) < new Date() : false,
      tokenExpiry: integration?.tokenExpiry || null,
      projectId,
      redirectUri,
      hasError: Boolean(integration?.lastError),
      lastError: integration?.lastError || null,
      defaultTimezone: integration?.settings?.defaultTimezone || 'Asia/Kolkata',
    }
  },

  /**
   * Helper: Generate direct 1-click Add to Google Calendar URL with timezone and conference link
   */
  generateGoogleCalendarUrl(event) {
    if (!event || !event.date) return 'https://calendar.google.com'
    const title = encodeURIComponent(event.title || event.name || 'Edufyi HR Event')
    const locText = event.location?.formattedAddress || event.location?.name || (event.meetingLink?.url ? 'Google Meet Video Call' : 'Edufyi Technologies')
    const location = encodeURIComponent(locText)

    let dates = ''
    if (event.allDay) {
      const start = String(event.date).replace(/-/g, '')
      const endD = new Date(event.endDate || event.date)
      endD.setDate(endD.getDate() + 1)
      const end = endD.toISOString().slice(0, 10).replace(/-/g, '')
      dates = `${start}/${end}`
    } else {
      const sDate = event.date.replace(/-/g, '')
      const eDate = (event.endDate || event.date).replace(/-/g, '')
      const sTime = (event.startTime || '10:00').replace(/:/g, '').slice(0, 4) + '00'
      const eTime = (event.endTime || '11:00').replace(/:/g, '').slice(0, 4) + '00'
      dates = `${sDate}T${sTime}/${eDate}T${eTime}`
    }

    const meetLine = event.meetingLink?.url ? `\n\nGoogle Meet Link: ${event.meetingLink.url}` : ''
    const orgLine = event.organizer?.name ? `\nOrganizer: ${event.organizer.name}` : ''
    const desc = encodeURIComponent(`${event.description || ''}${meetLine}${orgLine}\n\nScheduled via Edufyi HR Portal`)

    let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${desc}&location=${location}&ctz=${encodeURIComponent(event.timezone || 'Asia/Kolkata')}`

    // Add attendees if present
    const emails = (event.attendees || event.participants || [])
      .map((p) => p.email)
      .filter((e) => e && e.includes('@'))
    if (emails.length > 0) {
      url += `&add=${encodeURIComponent(emails.join(','))}`
    }

    return url
  },
}
