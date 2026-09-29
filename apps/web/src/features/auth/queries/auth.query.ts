import { queryOptions } from "@tanstack/react-query"

import { getCurrentUser } from "../server/functions/auth.functions"

export const authKeys = {
  all: ["auth"] as const,

  currentUser: () => [...authKeys.all, "current-user"] as const,
}

export const currentUserQuery = () => queryOptions({
  queryKey: authKeys.currentUser(),

  queryFn: () => getCurrentUser(),

  staleTime: 60_000,
})