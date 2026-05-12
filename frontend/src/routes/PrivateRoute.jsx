import { Navigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import { getAccessToken } from "../utils/token";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();

  const token = getAccessToken();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}