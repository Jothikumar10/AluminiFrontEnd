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
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  timeout: 15000,
});

/*
|--------------------------------------------------------------------------
| Request Interceptor
|--------------------------------------------------------------------------
| Automatically attaches the JWT token to protected API requests.
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");

      /*
      |--------------------------------------------------------------------------
      | Make sure headers exist
      |--------------------------------------------------------------------------
      */

      if (!config.headers) {
        config.headers = {};
      }

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
      | Debug Information
      |--------------------------------------------------------------------------
      | Do not print the actual token for security.
      |--------------------------------------------------------------------------
      */

      if (import.meta.env.DEV) {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
          token ? "JWT attached" : "No JWT"
        );
      }
    } catch (error) {
      console.error("Error reading authentication token:", error);
    }

    return config;
  },

  (error) => {
    console.error("Request interceptor error:", error);

    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Response Interceptor
|--------------------------------------------------------------------------
| Handles common API errors globally.
|--------------------------------------------------------------------------
*/

api.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
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
    | 401 Unauthorized
    |--------------------------------------------------------------------------
    */

    if (status === 401) {
      console.warn("Authentication failed:", message);

      const lowerMessage = String(message).toLowerCase();

      /*
      |--------------------------------------------------------------------------
      | Remove authentication data only when token is actually invalid.
      |--------------------------------------------------------------------------
      */

      const isInvalidToken =
        lowerMessage.includes("expired") ||
        lowerMessage.includes("invalid authentication token") ||
        lowerMessage.includes("invalid token") ||
        lowerMessage.includes("token is invalid") ||
        lowerMessage.includes("authentication required") ||
        lowerMessage.includes("authentication token is missing");

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
      console.warn("Access forbidden:", message);
    }

    /*
    |--------------------------------------------------------------------------
    | 404 Not Found
    |--------------------------------------------------------------------------
    */

    if (status === 404) {
      console.warn("API endpoint not found:", error.config?.url);
    }

    /*
    |--------------------------------------------------------------------------
    | 500 Server Error
    |--------------------------------------------------------------------------
    */

    if (status >= 500) {
      console.error("Backend server error:", message);
    }

    return Promise.reject(error);
  }
);

/*
|--------------------------------------------------------------------------
| Export API Instance
|--------------------------------------------------------------------------
*/

export default api;