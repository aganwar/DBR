// src/api.ts
import axios from "axios";

// Prefer Vite env; fall back to local dev API if missing
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:28900";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // keep false unless you use auth cookies
});

// Optional: small helper to unwrap error messages consistently
export const getErrorMessage = (e: unknown) => {
  if (axios.isAxiosError(e)) {
    return (
      e.response?.data?.message ||
      e.response?.data?.error ||
      e.message ||
      "Request failed"
    );
  }
  return String(e);
};
