import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/useAuth";

export default function useCurrentUser() {
  const { fetchMe, initializing } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: fetchMe,
    enabled: !initializing,
    staleTime: 2 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
