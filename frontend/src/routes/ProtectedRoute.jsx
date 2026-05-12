import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getAccessToken } from "../utils/token";

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const token = getAccessToken();

  if (initializing) return null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
