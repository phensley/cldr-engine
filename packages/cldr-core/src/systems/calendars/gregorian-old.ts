
/**
 * Overview of general interface for ICU calendar types:
 * http://userguide.icu-project.org/datetime/calendar
 *
 * Initially we will only support interfaces to construct and convert
 * between each calendar type. Later we can add methods to add/subtract
 * or otherwise diff calendars against one another.
 *
 * Exact time is held as the number of milliseconds since 1970-jan-01 00:00 UTC
 * Leap seconds are ignored.
 *
 * Flags to indicate when a field was set (relative time).
 * Setting a field increments the stamp. If the stamp == STAMP_MAX,
 * recalculate all stamp values.
 *
 * All fields are int32_t so should work fine with JS Number
 *
 * Calendar object must always have a valid timezone. Default to UTC if
 * none is explicitly set, or an invalid one is provided.
 */
