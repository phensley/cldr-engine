/**
 * Interface for providing raw time zone data to a Tz instance.
 *
 * @public
 */
export interface RawData {
  /**
   * Compressed index of until deltas.
   */
  index: string;

  /**
   * Time zone ids.
   */
  zoneids: string;

  /**
   * Time zone links.
   */
  links: string;

  /**
   * Array of packed zone infos sorted to match zone ids.
   */
  zoneinfo: string[];
}
