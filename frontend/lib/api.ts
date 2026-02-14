import axios from "axios";

/**
 * Pre-configured Axios instance for the PhoneMarket API.
 *
 * Base URL: http://localhost:8000 (proxied via Next.js rewrites in production)
 * Interceptor: Automatically attaches JWT from localStorage as Bearer token.
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
    timeout: 15_000,
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request Interceptor: Attach JWT ─────────
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 ────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            // Token expired or invalid — clear and redirect to login
            localStorage.removeItem("access_token");
            // Only redirect if not already on the login page
            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
