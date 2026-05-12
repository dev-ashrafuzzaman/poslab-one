import { useInfiniteQuery } from "@tanstack/react-query";
import useAxiosSecure from "./useAxiosSecure";

export default function useInfiniteTable({
  route,
  queryKey,
  limit = 20,
  filters = {},
  enabled = true,
}) {
  const { axiosSecure } = useAxiosSecure();

  return useInfiniteQuery({
    queryKey: [queryKey, filters],
    enabled,
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axiosSecure.get(route, {
        params: {
          page: pageParam,
          limit,
          ...filters,
        },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
