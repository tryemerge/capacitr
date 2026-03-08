"use client"

import { useQuery } from "@tanstack/react-query"

export interface IdeaMetadataRow {
  ideaId: string
  imageUrl: string | null
  pitch: string | null
  problemStatement: string | null
  tags: string[] | null
  targetCustomers: string | null
  comparables: string | null
  creatorName: string | null
  creatorAvatar: string | null
}

export type IdeaMetadataMap = Record<string, IdeaMetadataRow>

export function useIdeaMetadata() {
  return useQuery<IdeaMetadataMap>({
    queryKey: ["idea-metadata"],
    queryFn: async () => {
      const res = await fetch("/api/ideas/metadata")
      if (!res.ok) return {}
      return res.json()
    },
    staleTime: 60_000, // cache 1 min
  })
}
