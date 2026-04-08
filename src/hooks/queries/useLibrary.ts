import { getLibrary } from "@/api/library";
import { keys } from "@/api/keys";
import { Options, Response } from "@/api/types";
import { LibraryItem } from "@/types/library";
import { useInfiniteQuery } from "@tanstack/react-query";

interface useLibraryOptions {
  query?: Options;
  enabled?: boolean;
}

export function useLibrary(options?: useLibraryOptions) {
  return useInfiniteQuery<Response<LibraryItem>>({
    queryKey: keys.library.list(options?.query),
    queryFn: async ({ pageParam }) => {
      return getLibrary({ ...options?.query, page: pageParam as number });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      return lastPage.next ? (lastPageParam as number) + 1 : undefined;
    },
    retry: false,
    enabled: options?.enabled ?? true,
  });
}
