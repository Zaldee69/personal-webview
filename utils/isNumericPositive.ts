/**
 * return true when numric is positive
 * references:
 * - https://stackoverflow.com/a/24457420
 * @param value string
 * @returns boolean
 */
export function isNumericPositive(value: string): boolean {
  return /^\d+$/.test(value);
}
