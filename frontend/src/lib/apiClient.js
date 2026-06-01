// frontend/src/lib/apiClient.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || 
    (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
      ? "http://localhost:4000/api"
      : "https://agro-p23z.onrender.com/api"),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ✅ ADD SHOP CONTEXT 
  if (user?.shopId) {
    config.headers["x-shop-id"] = user.shopId;
  }

  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong";

    if (error.response?.data?.error) {
      message = error.response.data.error;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }

    console.error("API Error:", message);

    // ❌ Removed toast.error() here — individual components handle their own 
    // error toasts via showError(). Having it here caused duplicate toasts.

    return Promise.reject(error);
  }
);

export default api;

