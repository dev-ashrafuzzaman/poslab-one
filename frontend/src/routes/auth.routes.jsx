import React from "react";

const Login = React.lazy(() => import("../pages/auth/Login"));
const Unauthorized = React.lazy(() => import("../pages/errors/Unauthorized"));

export const authRoutes = [
  { path: "/login", element: <Login /> },
  { path: "/unauthorized", element: <Unauthorized /> },
];
