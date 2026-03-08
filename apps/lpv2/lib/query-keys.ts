/**
 * Centralised query-key factory (rule: query-key-factory).
 *
 * Structure: generic → specific.
 * Every key used by useQuery / useMutation / invalidateQueries should
 * come from here so invalidation is always consistent.
 */

export const ideaKeys = {
  all: ["ideas"] as const,

  lists: () => [...ideaKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...ideaKeys.lists(), filters] as const,

  details: () => [...ideaKeys.all, "detail"] as const,
  detail: (id: string) => [...ideaKeys.details(), id] as const,

  /** Draft being built in the multi-step submit wizard */
  drafts: () => [...ideaKeys.all, "draft"] as const,
  draft: (draftId: string) => [...ideaKeys.drafts(), draftId] as const,
} as const

export const userKeys = {
  all: ["users"] as const,
  me: () => [...userKeys.all, "me"] as const,
} as const
