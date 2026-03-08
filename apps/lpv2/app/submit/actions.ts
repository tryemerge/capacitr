"use server"

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
  const data = basicsSchema.parse(payload)

  // TODO: replace with real DB persistence
  await new Promise((r) => setTimeout(r, 600))

  const draftId = data.draftId ?? `draft_${Date.now()}`

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
  const data = contextSchema.parse(payload)

  // TODO: replace with real DB persistence
  await new Promise((r) => setTimeout(r, 600))

  return {
    draftId: data.draftId,
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
  const data = submitSchema.parse(payload)

  // TODO: replace with real DB persistence
  await new Promise((r) => setTimeout(r, 300))

  return {
    ideaId: `idea_${Date.now()}`,
    publishedAt: new Date().toISOString(),
    txHash: data.txHash,
  }
}
