import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAccessToken } from "../utils/token";
import Spinner from "../components/common/Spinner";

export default function PrivateRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  const token = getAccessToken();

  /* ===============================
     WAIT FOR AUTH INIT
  =============================== */
  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  /* ===============================
     BLOCK UNAUTHENTICATED
  =============================== */
  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* ===============================
     AUTH OK
  =============================== */
  return <Outlet />;
}
