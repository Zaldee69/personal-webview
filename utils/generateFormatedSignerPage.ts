import { arrRemoveDuplicates } from "./arrRemoveDuplicates";
import { isNumericPositive } from "./isNumericPositive";

/**
 * Generate formatted signer page, return formated string (ex: 1 | 1,2,3 | etc)
 *
 * @param pageText string
 * @returns string
 */
export const generateFormatedSignerPage = (pageText: string): string => {
  let pageTextToArr = pageText.split(",");

  pageTextToArr.forEach((v, i) => {
    let pageTextRangeFormat = v.split("-");
    if (isNumericPositive(v) && pageTextRangeFormat.length === 1) {
      // numeric, do nothing
    } else {
      if (pageTextRangeFormat.length === 2) {
        // accepted format "<number>-<number>"
        const numRangeStart = parseInt(pageTextRangeFormat[0]);
        const numRangeEnd = parseInt(pageTextRangeFormat[1]);

        if (
          isNumericPositive(numRangeStart.toString()) &&
          isNumericPositive(numRangeEnd.toString())
        ) {
          // format accepted
          // ex: "2-4" = "2,3,4"
          let pagesFromNumRange = [];

          for (let a = numRangeStart; a <= numRangeEnd; a++) {
            pagesFromNumRange.push(a);
          }

          pageTextToArr.splice(i, 1, pagesFromNumRange.join(","));
        } else {
          // format not accepted, remove elem from array
          pageTextToArr.splice(i, 1);
        }
      } else {
        // non numeric or wrong format, remove elem from array
        pageTextToArr.splice(i, 1);
      }
    }
  });

  let result = arrRemoveDuplicates(pageTextToArr).join(",");

  if (result === "0") {
    result = "";
  }

  return result;
};
