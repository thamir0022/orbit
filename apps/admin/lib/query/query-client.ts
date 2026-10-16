import { ErrorManager } from "@/error";
import { ApiError } from "@orbit/http-client";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(error) {
      ErrorManager.handle(error);
    },
  }),

  mutationCache: new MutationCache({
    onError(error) {
      ErrorManager.handle(error);
    },
  }),

  defaultOptions: {
    queries: {
      /**
       * Data is considered fresh for 5 minutes.
       */
      staleTime: 1000 * 60 * 5,

      /**
       * Keep inactive queries for 10 minutes.
       */
      gcTime: 1000 * 60 * 10,

      /**
       * Retry transient failures.
       *
       * Don't retry server errors.
       */
      retry(failureCount, error: unknown) {
        if (error instanceof ApiError && error.isServerError) {
          return false;
        }

        return failureCount < 2;
      },

      /**
       * If user comes back online,
       * refetch stale queries.
       */
      refetchOnReconnect: true,

      /**
       * Only refetch stale queries when
       * window regains focus.
       */
      refetchOnWindowFocus: true,

      /**
       * Refetch stale queries after mount.
       */
      refetchOnMount: true,
    },

    mutations: {
      retry: false,
    },
  },
});

// for better error (not many toast show in dashboard page) IN Future after tested current approach

// useQuery({
//   queryKey: ['projects'],
//   queryFn,
//   meta: {
//     showGlobalError: true,
//   },
// })

// onError(error, query) {
//   if (query.meta?.showGlobalError) {
//     ErrorManager.handle(error)
//   }
// }
