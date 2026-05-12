import React from "react";

const CompanyList = React.lazy(() =>
  import("../pages/setting/company/CompanyListPage"),
);
const CompanyCreate = React.lazy(() =>
  import("../pages/setting/company/CompanyDetailsPage"),
);

const Users = React.lazy(() =>
  import("../pages/setting/user/UserPage"),
);
const UserCreate = React.lazy(() =>
  import("../pages/setting/user/UserCreateModalPage"),
);
const Branches = React.lazy(() =>
  import("../pages/setting/branches/branchesPage"),
);

export const settingsRoutes = [
  { path: "settings/companies", element: <CompanyList /> },
  { path: "settings/companies/create", element: <CompanyCreate /> },
  { path: "settings/users", element: <Users /> },
  { path: "settings/users/create", element: <UserCreate /> },
  { path: "branches", element: <Branches /> },
];
