import MainLayout from "./MainLayout";
import BlankLayout from "./BlankLayout";

export const LAYOUTS = {
  main: MainLayout,
  blank: BlankLayout,
};

export default function LayoutWrapper({
  children,
  layout = "main",
}) {
  const LayoutComponent =
    LAYOUTS[layout] || MainLayout;

  return (
    <LayoutComponent>
      {children}
    </LayoutComponent>
  );
}