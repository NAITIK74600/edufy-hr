/**
 * Google Maps & Places Service
 * Handles physical address autocomplete, coordinates, and Google Maps direction links.
 * Works seamlessly with Google Maps API key or graceful fallback when key is not configured.
 */

export const googleMapsService = {
  getApiKey() {
    return process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || ''
  },

  isConfigured() {
    return Boolean(this.getApiKey())
  },

  generateMapsUrl({ address, name, latitude, longitude }) {
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    }
    const query = encodeURIComponent((name ? `${name}, ` : '') + (address || ''))
    return `https://www.google.com/maps/search/?api=1&query=${query}`
  },

  generateDirectionsUrl({ address, name, latitude, longitude }) {
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    }
    const dest = encodeURIComponent((name ? `${name}, ` : '') + (address || ''))
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}`
  },

  async autocompletePlaces(input) {
    if (!input || typeof input !== 'string' || input.trim().length < 2) {
      return []
    }
    const apiKey = this.getApiKey()

    if (apiKey) {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input.trim())}&key=${apiKey}&types=establishment|geocode`
        const response = await fetch(url)
        const data = await response.json()
        if (data.status === 'OK' && Array.isArray(data.predictions)) {
          return data.predictions.map((p) => ({
            placeId: p.place_id,
            description: p.description,
            mainText: p.structured_formatting?.main_text || p.description,
            secondaryText: p.structured_formatting?.secondary_text || '',
            name: p.structured_formatting?.main_text || p.description,
            address: p.description,
            formattedAddress: p.description,
            mapsUrl: `https://www.google.com/maps/place/?q=place_id:${p.place_id}`,
          }))
        }
      } catch (err) {
        console.warn('[GoogleMaps Places Autocomplete Notice]:', err.message)
      }
    }

    // High quality offline / preconfigured corporate locations and query fallback
    const corporateVenues = [
      { name: 'Head Office - Ignite Campus', address: 'Tech Park, Whitefield, Bangalore, Karnataka 560066', lat: 12.9716, lng: 77.5946 },
      { name: 'Branch Office - Velocity Hub', address: 'Indiranagar 100ft Road, Bangalore, Karnataka 560038', lat: 12.9784, lng: 77.6408 },
      { name: 'Innovation Lab - HSR Campus', address: '27th Main Rd, Sector 1, HSR Layout, Bangalore, Karnataka 560102', lat: 12.9121, lng: 77.6446 },
      { name: 'Client Center - Koramangala', address: '80 Feet Rd, 4th Block, Koramangala, Bangalore, Karnataka 560034', lat: 12.9352, lng: 77.6245 },
      { name: 'Executive Boardroom - MG Road', address: 'MG Road Metro Station Area, Bangalore, Karnataka 560001', lat: 12.9756, lng: 77.6066 },
    ]

    const matches = corporateVenues.filter((v) =>
      v.name.toLowerCase().includes(input.toLowerCase()) || v.address.toLowerCase().includes(input.toLowerCase())
    )

    const fallbackResults = matches.map((m) => ({
      placeId: `corp-${m.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      description: `${m.name}, ${m.address}`,
      mainText: m.name,
      secondaryText: m.address,
      name: m.name,
      address: m.address,
      formattedAddress: `${m.name}, ${m.address}`,
      latitude: m.lat,
      longitude: m.lng,
      mapsUrl: this.generateMapsUrl({ name: m.name, address: m.address, latitude: m.lat, longitude: m.lng }),
    }))

    // Always include user typed query as direct option
    fallbackResults.push({
      placeId: `custom-${Date.now()}`,
      description: input.trim(),
      mainText: input.trim(),
      secondaryText: 'Custom Location / Meeting Room',
      name: input.trim(),
      address: input.trim(),
      formattedAddress: input.trim(),
      mapsUrl: this.generateMapsUrl({ address: input.trim() }),
    })

    return fallbackResults
  },
}

