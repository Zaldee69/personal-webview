// get token from localStorage
// decide to redirect to login or not
// redirect and remove token when has tokan and expiresIn in localStorage
// not redirect and not remove token when not has expiresIn in localStorage but only has token

import { NextParsedUrlQuery } from "next/dist/server/request-meta";
import Router from "next/router";
import { UrlObject } from "url";

type TredirectTo = UrlObject | string;

/**
 * references:
 * - https://stackoverflow.com/a/30730835
 */

/**
 * Removes a key from localStorage and its sibling expiracy key
 * @param key string
 * @returns boolean
 */
export const removeStorageWithExpiresIn = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    localStorage.removeItem(key + "_expiresIn");
  } catch (e) {
    console.log(
      "removeStorage: Error removing key [" +
        key +
        "] from localStorage: " +
        JSON.stringify(e)
    );
    return false;
  }
  return true;
};

/**
 * Retrieves a key from localStorage previously set with setStorage()
 * @param key string
 * @param redirectTo string
 * @returns string | null
 */
export const getStorageWithExpiresIn = (
  key: string,
  redirectTo?: TredirectTo,
  redirectQuery?: NextParsedUrlQuery
): string | null => {
  var now = Date.now(); //epoch time, lets deal only with integer
  // set expiration for storage
  var expiresIn: string | number | null = localStorage.getItem(
    key + "_expiresIn"
  );

  // condition we dont have expiresIn on localStorage
  if (expiresIn === undefined || expiresIn === null) {
    expiresIn = 0;
  }

  expiresIn = parseInt(expiresIn as string);

  if (expiresIn < now) {
    // Expired
    // expiresIn === 0 indicate that expiresIn not exist on localStorage
    if (expiresIn !== 0) {
      removeStorageWithExpiresIn(key);
      if (redirectTo) {
        Router.replace({
          pathname: redirectTo as string,
          query: { ...redirectQuery },
        });
      }
      return null;
    } else {
      // expiresIn not on local storage
      // when has token, just return the token and dont do anything
      try {
        const value = localStorage.getItem(key);
        return value;
      } catch (e) {
        console.log(
          "getStorage: Error reading key [" +
            key +
            "] from localStorage: " +
            JSON.stringify(e)
        );
        return null;
      }
    }
  } else {
    try {
      var value = localStorage.getItem(key);
      return value;
    } catch (e) {
      console.log(
        "getStorage: Error reading key [" +
          key +
          "] from localStorage: " +
          JSON.stringify(e)
      );
      return null;
    }
  }
};

/**
 * Writes a key into localStorage setting a expire time
 * @param key string
 * @param value string
 * @param expires number
 * @returns boolean
 */
export const setStorageWithExpiresIn = (
  key: string,
  value: string,
  expires: number
): boolean => {
  if (expires === undefined || expires === null) {
    expires = 24 * 60 * 60; // default: seconds for 1 day
  } else {
    expires = Math.abs(expires); //make sure it's positive
  }

  // var now = Date.now(); //millisecs since epoch time, lets deal only with integer
  // var schedule = now + expires * 1000;
  var schedule = expires * 1000;
  try {
    localStorage.setItem(key, value);
    localStorage.setItem(key + "_expiresIn", schedule.toString());
  } catch (e) {
    console.log(
      "setStorage: Error setting key [" +
        key +
        "] in localStorage: " +
        JSON.stringify(e)
    );
    return false;
  }
  return true;
};
