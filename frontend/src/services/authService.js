// src/services/authService.js
import apiClient from "./apiClient";

/* ===========================
   LOGIN
   - Sets refresh cookie (HTTP-only)
   - Returns accessToken + user
=========================== */
export const loginApi = async ({ identifier, password }) => {
  const res = await apiClient.post(
    "/api/v1/auth/login",
    { identifier, password },
    { withCredentials: true } // 🍪 important
  );
  return res.data;
};

/* ===========================
   REFRESH ACCESS TOKEN
   - Uses HTTP-only cookie
=========================== */
export const refreshApi = async () => {
  const res = await apiClient.post(
    "/api/v1/auth/refresh",
    {},
    { withCredentials: true } // 🍪 important
  );
  return res.data;
};

/* ===========================
   CURRENT USER (/me)
   - Authorization header injected by axiosSecure
=========================== */

export const meApi = async (axiosSecure) => {
  const res = await axiosSecure.get("/users/me");
  return res.data;
};
/* ===========================
   LOGOUT
   - Clears refresh cookie server-side
=========================== */
export const logoutApi = async () => {
  return apiClient.post(
    "/api/v1/auth/logout",
    {},
    { withCredentials: true } // 🍪 important
  );
};
