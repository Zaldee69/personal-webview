import { handleRoute } from "@/utils/handleRoute";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import Router from "next/router";
import { toast } from "react-toastify";

const BASE_URL = process.env.NEXT_PUBLIC_DS_API_URL;

let isRefreshing = false;
let failedQueue: any = [];
const processQueue = (err: any, token = null) => {
  failedQueue.forEach((x: any) => {
    if (err) {
      x.reject(err);
    } else {
      x.resolve(token);
    }
  });

  failedQueue = [];
};

const clearAuth = () => {
  localStorage.removeItem("deviceToken");
  localStorage.removeItem("fingerprint");
  localStorage.removeItem(
    `tilakaName-${Router.query.tilaka_name || Router.query.user}`
  );
  localStorage.removeItem(
    `refreshToken-${Router.query.tilaka_name || Router.query.user}`
  );
  localStorage.removeItem(
    `token-${Router.query.tilaka_name || Router.query.user}`
  );
};

const unaunthenticated = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(window.location.search);
  const loginFromParam = urlParams.get("login_from");
  const pathname = window.location.pathname;

  clearAuth();

  if (queryString.includes("login_from")) {
    window.location.replace(handleRoute(`${loginFromParam}${queryString}`));
  } else if (pathname.includes("v2")) {
    window.location.replace(`/personal-webview/login/v2/${queryString}`);
  } else if (pathname.includes("authhash")) {
    toast.error("Sesi and telah habis");
    window.location.reload();
  } else {
    window.location.replace(`/personal-webview/login/${queryString}`);
  }
};

export async function createRefreshToken() {
  const { user_identifier, channel_id, tilaka_name, user } = Router.query;

  const device_token = localStorage.getItem("deviceToken");
  const fingerprint = localStorage.getItem("fingerprint");
  const refresh_token = localStorage.getItem(
    `refreshToken-${tilaka_name || user || user_identifier}`
  );
  const rememberMe = localStorage.getItem(
    `rememberMe-${tilaka_name || user || user_identifier}`
  );

  if (!rememberMe) {
    unaunthenticated();
  } else {
    try {
      const refreshResponse = await axios.post(`${BASE_URL}/v2/refreshToken`, {
        channel_id,
        device_token,
        fingerprint,
        refresh_token,
        user_identifier: user_identifier || tilaka_name || user,
      });

      if (refreshResponse.data.success) {
        console.log(user_identifier);
        localStorage.setItem(
          `token-${user_identifier || tilaka_name || user}`,
          refreshResponse.data.data.token
        );
        isRefreshing = false;
        processQueue(null, refreshResponse.data.data.token);
        return refreshResponse.data.token;
      } else {
        console.error("Refresh token failed:", refreshResponse.data.message);
        unaunthenticated();
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError?.response?.status === 401) {
        processQueue(axiosError);
        unaunthenticated();
      } else {
        isRefreshing = false;
        return Promise.reject(axiosError);
      }

      console.log("Error refreshing token: ", axiosError);
    }
  }
}

const handleUnauthorize = async (
  instance: AxiosInstance,
  error: AxiosError
) => {
  console.log("Handling unauthorized error...");

  const originalRequest = error.config;

  const rememberMe = localStorage.getItem(
    `rememberMe-${Router.query.tilaka_name || Router.query.user}`
  );
  const refresh_token = localStorage.getItem(
    `refreshToken-${Router.query.tilaka_name || Router.query.user}`
  );

  if (!rememberMe) {
    unaunthenticated();
    throw error; // Throw the error to prevent further processing
  }

  if (!originalRequest || originalRequest.url?.includes("/login")) {
    throw error;
  }

  if (isRefreshing) {
    // If already refreshing, return a promise without initiating another refresh
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((accessToken) => {
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      return instance(originalRequest);
    });
  }

  try {
    isRefreshing = true;

    const accessToken = await createRefreshToken();

    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    isRefreshing = false;

    // Process the failed requests queue
    failedQueue.forEach((promise: any) => promise.resolve(accessToken));

    failedQueue = [];

    // Retry the original request with the new token
    if (originalRequest && originalRequest.headers) {
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    }
    return instance(originalRequest);
  } catch (err) {
    // If refresh token fails, handle the error
    isRefreshing = false;
    throw err;
  }
};

// Create base URL API
export const CORE_API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_DS_API_URL || "https://dev-api.tilaka.id",
});

CORE_API.interceptors.request.use(
  async (config: AxiosRequestConfig) => {
    const accessToken = localStorage.getItem(
      `token-${Router.query.tilaka_name || Router.query.user}`
    );

    // Ensure config.headers is treated as an object
    if (config.headers === undefined) {
      config.headers = {};
    }

    // Merge default headers
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

CORE_API.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const solution = handleUnauthorize(CORE_API, error);
      return solution;
    } else {
      return Promise.reject(error);
    }
  }
);

export default CORE_API;
