import React from "react";
import { LAYOUTS, ACTIVE_DASHBOARD_LAYOUT } from "./Layouts";

export default function LayoutWrapper({ children, layout = "main" }) {
  // If layout type is "dashboard", use the globally active dashboard layout
  const selectedLayout =
    layout.startsWith("dashboard")
      ? LAYOUTS[ACTIVE_DASHBOARD_LAYOUT]
      : LAYOUTS[layout];

  const LayoutComponent = selectedLayout || LAYOUTS.main;
  return <LayoutComponent>{children}</LayoutComponent>;
}
