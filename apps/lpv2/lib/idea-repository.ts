/**
 * Idea Repository — storage abstraction for idea metadata.
 *
 * Currently backed by localStorage for prototyping.
 * To swap in a real database (Drizzle, Supabase, etc.), implement
 * the IdeaRepository interface and replace the export.
 */

import type { BasicsPayload, ContextPayload, SubmitPayload } from "@/app/submit/schemas"

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface IdeaDraft {
  draftId: string
  // Basics
  title: string
  pitch: string
  tokenTicker: string
  tags: string[]
  // Context (optional until step 2)
  problemStatement?: string
  targetCustomers?: string
  comparables?: { name: string; url: string; description: string }[]
  businessModel?: string
  marketSize?: string
  briefsAndMemos?: string
  coverImageUrl?: string
  // On-chain references
  onChainIdeaId?: string
  txHash?: string
  // Timestamps
  createdAt: string
  updatedAt: string
  publishedAt?: string
  status: "draft" | "published"
}

// ---------------------------------------------------------------------------
// Repository interface — swap this implementation to change storage backend
// ---------------------------------------------------------------------------

export interface IdeaRepository {
  /** Create or update basics (step 1). Returns the draftId. */
  saveBasics(payload: BasicsPayload): Promise<{ draftId: string; savedAt: string }>

  /** Update context fields (step 2). */
  saveContext(payload: ContextPayload): Promise<{ draftId: string; savedAt: string }>

  /** Mark as published (step 3). */
  submit(payload: SubmitPayload): Promise<{ ideaId: string; publishedAt: string; txHash?: string }>

  /** Get a single draft/idea by ID. */
  getById(id: string): Promise<IdeaDraft | null>

  /** List all saved ideas (most recent first). */
  listAll(): Promise<IdeaDraft[]>

  /** Delete a draft. */
  delete(id: string): Promise<void>
}

// ---------------------------------------------------------------------------
// localStorage implementation
// ---------------------------------------------------------------------------

const STORAGE_KEY = "capacitr:ideas"

function readStore(): Record<string, IdeaDraft> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(store: Record<string, IdeaDraft>): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

class LocalStorageIdeaRepository implements IdeaRepository {
  async saveBasics(payload: BasicsPayload): Promise<{ draftId: string; savedAt: string }> {
    const store = readStore()
    const now = new Date().toISOString()
    const draftId = payload.draftId ?? `draft_${Date.now()}`

    const existing = store[draftId]

    store[draftId] = {
      ...existing,
      draftId,
      title: payload.title,
      pitch: payload.pitch,
      tokenTicker: payload.tokenTicker,
      tags: payload.tags,
      status: existing?.status ?? "draft",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }

    writeStore(store)
    return { draftId, savedAt: now }
  }

  async saveContext(payload: ContextPayload): Promise<{ draftId: string; savedAt: string }> {
    const store = readStore()
    const now = new Date().toISOString()
    const existing = store[payload.draftId]

    if (!existing) {
      throw new Error(`Draft ${payload.draftId} not found`)
    }

    store[payload.draftId] = {
      ...existing,
      problemStatement: payload.problemStatement,
      targetCustomers: payload.targetCustomers,
      comparables: payload.comparables,
      businessModel: payload.businessModel,
      marketSize: payload.marketSize,
      briefsAndMemos: payload.briefsAndMemos,
      coverImageUrl: payload.coverImageUrl,
      updatedAt: now,
    }

    writeStore(store)
    return { draftId: payload.draftId, savedAt: now }
  }

  async submit(payload: SubmitPayload): Promise<{ ideaId: string; publishedAt: string; txHash?: string }> {
    const store = readStore()
    const now = new Date().toISOString()
    const ideaId = `idea_${Date.now()}`

    // Update the draft to published status with all final data
    const existing = store[payload.draftId]

    store[payload.draftId] = {
      ...(existing ?? {}),
      draftId: payload.draftId,
      title: payload.title,
      pitch: payload.pitch,
      tokenTicker: payload.tokenTicker,
      tags: payload.tags,
      problemStatement: payload.problemStatement,
      targetCustomers: payload.targetCustomers,
      comparables: payload.comparables,
      businessModel: payload.businessModel,
      marketSize: payload.marketSize,
      briefsAndMemos: payload.briefsAndMemos,
      coverImageUrl: payload.coverImageUrl,
      txHash: payload.txHash,
      status: "published",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      publishedAt: now,
    }

    writeStore(store)
    return { ideaId, publishedAt: now, txHash: payload.txHash }
  }

  async getById(id: string): Promise<IdeaDraft | null> {
    const store = readStore()
    return store[id] ?? null
  }

  async listAll(): Promise<IdeaDraft[]> {
    const store = readStore()
    return Object.values(store).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
  }

  async delete(id: string): Promise<void> {
    const store = readStore()
    delete store[id]
    writeStore(store)
  }
}

// ---------------------------------------------------------------------------
// Singleton export — swap this line to change storage backend
// e.g.: export const ideaRepository: IdeaRepository = new DrizzleIdeaRepository(db)
// ---------------------------------------------------------------------------

export const ideaRepository: IdeaRepository = new LocalStorageIdeaRepository()
