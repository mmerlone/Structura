import moment from 'moment-timezone'

import { Timezone } from '@/types/timezone.types'

// Note: This utility can be used in both client and server environments
// Logging is handled by the caller if needed

/**
 * Gets all available IANA timezones with their current offsets using moment-timezone
 * @returns Array of Timezone objects sorted by offset and name
 */
export function getTimezones(): Timezone[] {
  const timezoneNames = moment.tz.names()
  const now = moment()

  const timezones = timezoneNames.map((name: string) => {
    const zone = moment.tz.zone(name)
    const timestamp = now.valueOf()
    const offsetInMinutes = zone?.utcOffset(timestamp) ?? 0
    const offsetInHours = offsetInMinutes / 60
    const offsetFormatted = `UTC${offsetInHours < 0 ? '+' : '-'}${offsetInHours}`
    const displayName = name.replace(/_/g, ' ')

    return {
      value: name,
      label: `${displayName} (${offsetFormatted})`,
      offset: offsetInHours,
    }
  })

  return timezones.sort((a, b) => {
    return a.value.localeCompare(b.value)
  })
}

/**
 * Gets the user's current timezone using moment-timezone
 * @returns The IANA timezone string (e.g., 'America/New_York')
 */
export function getCurrentTimezone(): string {
  try {
    const guessedTz = moment.tz.guess()

    if (!guessedTz) {
      const timezone = Intl?.DateTimeFormat().resolvedOptions().timeZone
      return timezone || 'UTC'
    }

    return guessedTz
  } catch (e) {
    console.warn('Could not determine timezone, using UTC as fallback:', e)
    return 'UTC'
  }
}
