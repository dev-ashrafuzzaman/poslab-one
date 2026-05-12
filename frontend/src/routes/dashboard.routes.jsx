import React from "react";

const Dashboard = React.lazy(() => import("../pages/dashboard/Dashboard"));

export const dashboardRoutes = [
  { index: true, element: <Dashboard /> },
  { path: "dashboard", element: <Dashboard /> },
];
