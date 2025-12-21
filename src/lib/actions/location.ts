'use server'

import { buildLogger } from '@/lib/logger/server'
import { getCountryByCode } from '@/lib/utils/location-utils'

const logger = buildLogger('location-actions')

/**
 * Server Action to detect the user's country using IP geolocation.
 * Replaces the legacy /api/location/country API route.
 */
export async function detectCountry(): Promise<string | null> {
  try {
    // Get API key from server-side environment variable
    const apiKey = process.env.IPGEOLOCATION_API_KEY
    if (apiKey === null || apiKey === undefined) {
      logger.error({}, 'IPGEOLOCATION_API_KEY not found in server environment variables')
      return null
    }

    logger.debug({}, 'Fetching country using IP geolocation API (Server Action)')

    // Call IP geolocation API without IP parameter to auto-detect client IP
    const response = await fetch(`https://api.ipgeolocation.io/v2/ipgeo?fields=location&apiKey=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      logger.warn(
        {
          status: response.status,
          statusText: response.statusText,
        },
        'Failed to fetch country from IP geolocation API (Server Action)'
      )
      return null
    }

    interface IpGeolocationResponse {
      location?: {
        country_code2?: string
      }
    }

    const data = (await response.json()) as IpGeolocationResponse
    const countryCode = data.location?.country_code2

    if (countryCode === null || countryCode === undefined) {
      logger.warn({ data }, 'No country code found in IP geolocation response')
      return null
    }

    // Validate country code with country-state-city module
    const country = getCountryByCode(countryCode)
    if (!country) {
      logger.warn({ countryCode }, 'Invalid country code received from API')
      return null
    }

    logger.info(
      {
        countryCode,
        countryName: country.name,
      },
      'Successfully detected country from IP geolocation (Server Action)'
    )

    return country.isoCode
  } catch (error) {
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      logger.warn({ error: 'Request timeout' }, 'IP geolocation API timeout')
      return null
    }

    logger.error({ error }, 'Unexpected error in IP geolocation API (Server Action)')
    return null
  }
}
