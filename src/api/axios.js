import axios from "axios";

/*
|--------------------------------------------------------------------------
| API Configuration
|--------------------------------------------------------------------------
*/

const API_BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    Accept: "application/json",
  },

  // 10 minutes
  // Useful for large video uploads up to 500 MB.
  timeout: 600000,
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      /*
      |--------------------------------------------------------------------------
      | Attach JWT
      |--------------------------------------------------------------------------
      */

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      /*
      |--------------------------------------------------------------------------
      | Content-Type Handling
      |--------------------------------------------------------------------------
      |
      | JSON requests:
      |     application/json
      |
      | FormData requests:
      |     Browser/Axios automatically creates
      |     multipart/form-data with the correct boundary.
      |
      |--------------------------------------------------------------------------
      */

      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      } else {
        config.headers["Content-Type"] = "application/json";
      }

      /*
      |--------------------------------------------------------------------------
      | Development Debugging
      |--------------------------------------------------------------------------
      */

      if (import.meta.env.DEV) {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
          token ? "JWT attached" : "No JWT"
        );

        if (config.data instanceof FormData) {
          console.log("[API Request] Multipart/FormData request");
        }
      }
    } catch (error) {
      console.error(
        "Error reading authentication token:",
        error
      );
    }

    return config;
  },

  (error) => {
    console.error(
      "Request interceptor error:",
      error
    );

    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    /*
    |--------------------------------------------------------------------------
    | Timeout
    |--------------------------------------------------------------------------
    */

    if (
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      console.error(
        "Request timed out:",
        error.message
      );

      return Promise.reject(error);
    }

    /*
    |--------------------------------------------------------------------------
    | No Response From Server
    |--------------------------------------------------------------------------
    */

    if (!error.response) {
      console.error(
        "Network error: Backend server may not be running.",
        error.message
      );

      return Promise.reject(error);
    }

    const status = error.response.status;

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went wrong.";

    /*
    |--------------------------------------------------------------------------
    | 400 Bad Request
    |--------------------------------------------------------------------------
    */

    if (status === 400) {
      console.error(
        "Bad request:",
        message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 401 Unauthorized
    |--------------------------------------------------------------------------
    */

    if (status === 401) {
      console.warn(
        "Authentication failed:",
        message
      );

      const lowerMessage = String(
        message
      ).toLowerCase();

      const isInvalidToken =
        lowerMessage.includes("expired") ||
        lowerMessage.includes(
          "invalid authentication token"
        ) ||
        lowerMessage.includes("invalid token") ||
        lowerMessage.includes(
          "token is invalid"
        ) ||
        lowerMessage.includes(
          "authentication required"
        ) ||
        lowerMessage.includes(
          "authentication token is missing"
        );

      if (isInvalidToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }

    /*
    |--------------------------------------------------------------------------
    | 403 Forbidden
    |--------------------------------------------------------------------------
    */

    if (status === 403) {
      console.warn(
        "Access forbidden:",
        message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 404 Not Found
    |--------------------------------------------------------------------------
    */

    if (status === 404) {
      console.warn(
        "API endpoint not found:",
        error.config?.url
      );
    }

    /*
    |--------------------------------------------------------------------------
    | 500+ Server Error
    |--------------------------------------------------------------------------
    */

    if (status >= 500) {
      console.error(
        "Backend server error:",
        message
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Backend Response
    |--------------------------------------------------------------------------
    */

    if (import.meta.env.DEV) {
      console.error(
        "Backend response:",
        error.response?.data
      );
    }

    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default api;




















































