import { TLoginPayload } from "@/interface/interface";
import axios from "axios";
import jwt from "jsonwebtoken";

const BASE_URL = process.env.NEXT_PUBLIC_DS_API_URL;

export function isTokenExpired(token: string): boolean | undefined {
  try {
    const decodeToken = jwt.decode(token);
    const currentTimeStamp = Math.floor(Date.now() / 1000);

    if (decodeToken !== null && typeof decodeToken !== "string") {
      return decodeToken.exp < currentTimeStamp;
    } else {
      return undefined;
    }
  } catch (e) {
    console.warn("Failed to check JWT expiration:", e);
    return true;
  }
}

export async function getBrowserFingerprint() {
  try {
    let navigatorInfo: {
      userAgent: string;
      language: string;
      platform: string;
      hardwareConcurrency?: number | undefined;
      deviceMemory?: string;
    } = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    };

    if (navigator.hardwareConcurrency) {
      navigatorInfo.hardwareConcurrency = navigator.hardwareConcurrency;
    }

    const deviceMemory = (navigator as any).deviceMemory;

    if (deviceMemory) {
      navigatorInfo.deviceMemory = deviceMemory;
    }

    let canvasFingerPrint = "";

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px Arial";
        ctx.fillStyle = "#f60";
        ctx.fillRect(50, 50, 100, 100);
        ctx.fillStyle = "#069";
        ctx.fillText("Hello world", 60, 60);
        canvasFingerPrint = canvas.toDataURL();
      } else {
        console.log("Canvas context is null");
      }
    } catch (e) {
      console.error("Canvas fingerprinting failed:", e);
    }

    // Concatenate data for hashing
    const dataHash = [JSON.stringify(navigatorInfo), canvasFingerPrint].join(
      "::"
    );

    // Convert the string to a Uint8Array for hashing
    const encoder = new TextEncoder();
    const dataAsUint8Array = encoder.encode(dataHash);

    // Perform SHA-256 hash
    const hashBuffer = await crypto.subtle.digest("SHA-256", dataAsUint8Array);

    // Convert the hash to a hexadecimal string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  } catch (error) {
    throw error;
  }
}

export async function login(
  tilaka_name: string,
  password: string,
  channel_id: string,
  request_id: string,
  remember: boolean
) {
  try {
    const deviceToken = await getBrowserFingerprint();

    const body: TLoginPayload = {
      tilaka_name,
      password,
      channel_id,
      request_id,
    };

    const remember = localStorage.getItem("rememberMe");

    if (remember) {
      body.device_token = deviceToken;
    }

    const loginResponse = await axios.post(`${BASE_URL}/checkPassword`, body);

    const TOKEN = loginResponse?.data.data[0];
    const REFSRESH_TOKEN = loginResponse?.data.data[1];
    const FINGERPRINT = deviceToken;
    const DEVICE_TOKEN =
      loginResponse.data.data[loginResponse.data.data.length - 1].split(
        "device_token:"
      )[1];

    if (loginResponse.data.success) {
      // Save token, refresh token, and device token to local storage
      localStorage.setItem("token", TOKEN);

      if (remember) {
        body.device_token = deviceToken;
        localStorage.setItem("refreshToken", REFSRESH_TOKEN);
      }

      localStorage.setItem("deviceToken", DEVICE_TOKEN);
      localStorage.setItem("fingerprint", FINGERPRINT);

      // if (remember) {
      //   localStorage.setItem(
      //     "deviceToken",
      //     loginResponse?.data.data.device_token
      //   );
      // }
    }

    return loginResponse;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
