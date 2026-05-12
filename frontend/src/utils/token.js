export const ACCESS_KEY = "access_token";

let logoutInProgress = false;

/* ===========================
   GET ACCESS TOKEN
=========================== */
export const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_KEY);
  } catch {
    return null;
  }
};

/* ===========================
   SET ACCESS TOKEN
=========================== */
export const setAccessToken = (token) => {
  try {
    if (token) {
      localStorage.setItem(ACCESS_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_KEY);
    }
  } catch {}
};

/* ===========================
   LOGOUT GUARD
=========================== */
export const markLogout = () => {
  logoutInProgress = true;
};

export const isLogoutInProgress = () => logoutInProgress;

/* ===========================
   CLEAR ALL AUTH STATE
=========================== */
export const clearTokens = () => {
  try {
    localStorage.removeItem(ACCESS_KEY);
  } catch {}
};
