import jwt from "jsonwebtoken";

/**
 * get exp from decoded token
 * @param token string
 * @returns number | null
 *
 */
export const getExpFromToken = (token: string): number | null => {
  const decodedToken = jwt.decode(token);

  if (decodedToken !== null && typeof decodedToken !== "string") {
    return decodedToken.exp;
  }

  return null;
};
