import { useEffect, useState, useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";

import {
  loginApi,
  refreshApi,
  meApi,
  logoutApi,
} from "../services/authService";

import {
  setAccessToken,
  getAccessToken,
  clearTokens,
  markLogout,
  isLogoutInProgress,
} from "../utils/token";

import useAxiosSecure from "../hooks/useAxiosSecure";

import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  /* ======================================================
     STATE
  ====================================================== */
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  /* ======================================================
     LOGOUT
  ====================================================== */
  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // ignore logout api errors
    } finally {
      markLogout();

      clearTokens();

      setUser(null);

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  /* ======================================================
     AXIOS INSTANCE
  ====================================================== */
  const { axiosSecure } = useAxiosSecure({
    onRefreshFail: async () => {
      await handleLogout();
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
     INITIAL AUTH CHECK
  ====================================================== */
  useEffect(() => {
    let cancelled = false;

    const initAuth = async () => {
      setInitializing(true);

      try {
        /* ------------------------------
           BLOCK REFRESH AFTER LOGOUT
        ------------------------------ */
        if (isLogoutInProgress()) {
          clearTokens();

          setUser(null);

          return;
        }

        /* ------------------------------
           GET ACCESS TOKEN
        ------------------------------ */
        let accessToken = getAccessToken();

        /* ------------------------------
           TRY REFRESH
        ------------------------------ */
        if (!accessToken) {
          const resp = await refreshApi();

          accessToken = resp?.data?.accessToken;

          if (accessToken) {
            setAccessToken(accessToken);
          }
        }

        /* ------------------------------
           FETCH USER
        ------------------------------ */
        if (accessToken && !cancelled) {
          const currentUser = await fetchMe();

          if (!currentUser) {
            clearTokens();
          }
        } else {
          setUser(null);
        }
      } catch {
        clearTokens();

        setUser(null);
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, [fetchMe]);

  /* ======================================================
     LOGIN
  ====================================================== */
  const handleLogin = useCallback(async ({ identifier, password }) => {
    const res = await loginApi({
      identifier,
      password,
    });

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

  /* ======================================================
     PROVIDER
  ====================================================== */
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
