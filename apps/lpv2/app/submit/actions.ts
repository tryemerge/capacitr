"use server"

/**
 * Server actions for the submit wizard.
 *
 * Currently these are thin pass-throughs that validate schemas.
 * The actual persistence happens client-side via ideaRepository (localStorage).
 *
 * When migrating to a real DB (e.g. Drizzle), move the repository calls here
 * and swap the localStorage implementation for a DB-backed one.
 */

import {
  basicsSchema,
  contextSchema,
  submitSchema,
  type BasicsPayload,
  type ContextPayload,
  type SubmitPayload,
} from "./schemas"

// ---- Step 1: Save Basics ----

export interface SaveBasicsResult {
  draftId: string
  savedAt: string
}

export async function saveBasics(
  payload: BasicsPayload,
): Promise<SaveBasicsResult> {
  // Validate on server side
  basicsSchema.parse(payload)

  const draftId = payload.draftId ?? `draft_${Date.now()}`

  return {
    draftId,
    savedAt: new Date().toISOString(),
  }
}

// ---- Step 2: Save Context ----

export interface SaveContextResult {
  draftId: string
  savedAt: string
}

export async function saveContext(
  payload: ContextPayload,
): Promise<SaveContextResult> {
  // Validate on server side
  contextSchema.parse(payload)

  return {
    draftId: payload.draftId,
    savedAt: new Date().toISOString(),
  }
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
  // Validate on server side
  submitSchema.parse(payload)

  return {
    ideaId: `idea_${Date.now()}`,
    publishedAt: new Date().toISOString(),
    txHash: payload.txHash,
  }
}
