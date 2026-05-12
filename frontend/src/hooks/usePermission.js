import { useCallback, useMemo } from "react";
import useCurrentUser from "./useCurrentUser";

export default function usePermission() {
  const { data: user } = useCurrentUser();

  const permissions = useMemo(
    () => user?.permissions || [],
    [user]
  );

  return useCallback(
    (...required) =>
      user?.isSuperAdmin ||
      required.every((p) => permissions.includes(p)),
    [permissions, user]
  );
}
