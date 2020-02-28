/**
 * Very low-level access to strings in a bundle. Includes properties
 * needed to resolve locales within a pack.
 *
 * @public
 */
export interface PrimitiveBundle {
  id(): string;
  language(): string;
  region(): string;
  get(offset: number): string;
}
