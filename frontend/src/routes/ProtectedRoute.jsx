import { Outlet } from "react-router-dom";

import PrivateRoute from "../routes/PrivateRoute";
import LayoutWrapper from "../layouts/LayoutWrapper";
export default function ProtectedLayout() {
  return (
    <PrivateRoute>
      <LayoutWrapper layout="main">
        <Outlet />
      </LayoutWrapper>
    </PrivateRoute>
  );
}