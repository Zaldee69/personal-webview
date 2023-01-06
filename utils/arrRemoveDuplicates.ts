/**
 *
 * @param arr Array<any>
 * @returns Array<any>
 */
export function arrRemoveDuplicates(arr: Array<any>) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}
