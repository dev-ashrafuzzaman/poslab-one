import MainLayout from "./MainLayout";
import BlankLayout from "./BlankLayout";

// Define available layouts
export const LAYOUTS = {
  main: MainLayout,
  blank: BlankLayout,
};

// 🔧 Select active dashboard layout globally here:
export const ACTIVE_DASHBOARD_LAYOUT = "main"; // just change this!
