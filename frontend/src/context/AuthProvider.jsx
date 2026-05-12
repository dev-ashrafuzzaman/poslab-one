// src/context/AuthProvider.jsx
import { useEffect, useState, useCallback, useMemo } from "react";

import {
  loginApi,
  refreshApi,
  meApi,
  logoutApi,
} from "../services/authService";

import { setAccessToken, getAccessToken, clearTokens, markLogout, isLogoutInProgress } from "../utils/token";

import useAxiosSecure from "../hooks/useAxiosSecure";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();
  /* ======================================================
     AXIOS INSTANCE
  ====================================================== */
  const { axiosSecure } = useAxiosSecure({
    onRefreshFail: async () => {
      await handleLogout(true);
    },
  });

  /* ======================================================
     FETCH CURRENT USER
  ====================================================== */
  const fetchMe = useCallback(async () => {
    try {
      const res = await meApi(axiosSecure);
      const userData = res?.data?.user || res;
      setUser(userData);
      return userData;
    } catch {
      setUser(null);
      return null;
    }
  }, [axiosSecure]);

  /* ======================================================
     INIT AUTH
  ====================================================== */
useEffect(() => {
  let cancelled = false;

  const initAuth = async () => {
    setInitializing(true);

    try {
      // 🔒 LOGOUT হলে আর কিছুই করবে না
      if (isLogoutInProgress()) {
        clearTokens();
        setUser(null);
        return;
      }

      let accessToken = getAccessToken();

      if (!accessToken) {
        const resp = await refreshApi();
        accessToken = resp?.data?.accessToken;
        if (accessToken) setAccessToken(accessToken);
      }

      if (accessToken && !cancelled) {
        await fetchMe();
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      if (!cancelled) setInitializing(false);
    }
  };

  initAuth();
  return () => (cancelled = true);
}, [fetchMe]);
  /* ======================================================
     LOGIN
  ====================================================== */
  const handleLogin = useCallback(async ({ identifier, password }) => {
    const res = await loginApi({ identifier, password });

    const accessToken = res?.data?.accessToken;
    const userObj = res?.data?.user;

    if (!accessToken || !userObj) {
      throw new Error("Invalid login response");
    }

    setAccessToken(accessToken);
    setUser(userObj);

    return userObj;
  }, []);

  /* ======================================================
     LOGOUT (NO NAVIGATION HERE)
  ====================================================== */
const handleLogout = useCallback(async () => {
  try {
    await logoutApi(); // may 401 → OK
  } catch {
    // ignore
  } finally {
    markLogout();          // 🔒 BLOCK refresh forever
    clearTokens();         // 🔥 REMOVE access token
    setUser(null);         // 🔥 CLEAR state
    navigate("/login", { replace: true });
  }
}, [navigate]);
  /* ======================================================
     CONTEXT VALUE
  ====================================================== */
  const contextValue = useMemo(
    () => ({
      user,
      initializing,
      login: handleLogin,
      logout: handleLogout,
      fetchMe,
      axiosSecure,
    }),
    [user, initializing, handleLogin, handleLogout, fetchMe, axiosSecure],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
