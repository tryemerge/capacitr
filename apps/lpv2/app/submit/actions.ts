"use server"

import {
  basicsSchema,
  contextSchema,
  submitSchema,
  type BasicsPayload,
  type ContextPayload,
  type SubmitPayload,
} from "./schemas"
import { getDb } from "@capacitr/database/client"
import { ideaMetadata } from "@capacitr/database/schema"

// ---- Step 1: Save Basics ----

export interface SaveBasicsResult {
  draftId: string
  savedAt: string
}

export async function saveBasics(
  payload: BasicsPayload,
): Promise<SaveBasicsResult> {
  basicsSchema.parse(payload)
  const draftId = payload.draftId ?? `draft_${Date.now()}`
  return { draftId, savedAt: new Date().toISOString() }
}

// ---- Step 2: Save Context ----

export interface SaveContextResult {
  draftId: string
  savedAt: string
}

export async function saveContext(
  payload: ContextPayload,
): Promise<SaveContextResult> {
  contextSchema.parse(payload)
  return { draftId: payload.draftId, savedAt: new Date().toISOString() }
}

// ---- Step 3: Final submit ----

export interface SubmitIdeaResult {
  ideaId: string
  publishedAt: string
  txHash?: string
}

export async function submitIdeaAction(
  payload: SubmitPayload,
): Promise<SubmitIdeaResult> {
  submitSchema.parse(payload)

  // Save metadata to DB if we have an on-chain ideaId
  if (payload.onChainIdeaId) {
    try {
      const db = getDb()
      await db
        .insert(ideaMetadata)
        .values({
          ideaId: payload.onChainIdeaId,
          imageUrl: payload.coverImageUrl || null,
          pitch: payload.pitch,
          problemStatement: payload.problemStatement || null,
          tags: payload.tags,
          targetCustomers: payload.targetCustomers || null,
          comparables: payload.comparables
            ? payload.comparables.map((c) => `${c.name}: ${c.description}`).join("; ")
            : null,
        })
        .onConflictDoUpdate({
          target: ideaMetadata.ideaId,
          set: {
            imageUrl: payload.coverImageUrl || null,
            pitch: payload.pitch,
            problemStatement: payload.problemStatement || null,
            tags: payload.tags,
            targetCustomers: payload.targetCustomers || null,
            updatedAt: new Date(),
          },
        })
    } catch (err: any) {
      console.error("Failed to save idea metadata:", err.message)
      // Don't fail the submit — on-chain tx already succeeded
    }
  }

  return {
    ideaId: payload.onChainIdeaId ?? `idea_${Date.now()}`,
    publishedAt: new Date().toISOString(),
    txHash: payload.txHash,
  }
}
