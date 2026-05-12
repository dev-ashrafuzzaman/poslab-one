import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

import PrivateRoute from "./PrivateRoute";

import { authRoutes } from "./auth.routes";
import { dashboardRoutes } from "./dashboard.routes";
import { settingsRoutes } from "./settings.routes";
import { accountingRoutes } from "./accounting.routes";
import { reportRoutes } from "./reports.routes";
import App from "../App";
import Spinner from "../components/common/Spinner";
import NotFound from "../pages/errors/NotFound";

export const router = createBrowserRouter([
  ...authRoutes,
  {
    path: "/",
    element: (
      <Suspense fallback={<Spinner />}>
        <PrivateRoute>
          <App />
        </PrivateRoute>
      </Suspense>
    ),
    children: [
      ...dashboardRoutes,
      ...settingsRoutes,
      ...accountingRoutes,
      ...reportRoutes,
    ],
  },
  { path: "*", element: <NotFound /> },
]);
