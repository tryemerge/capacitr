"use client"

import { useMutation } from "@tanstack/react-query"
import type {
  GenerateContextRequest,
  GenerateContextResponse,
} from "@/app/api/ai/generate-context/route"

async function generateContext(
  input: GenerateContextRequest
): Promise<GenerateContextResponse> {
  const res = await fetch("/api/ai/generate-context", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? "Failed to generate context")
  }

  return res.json()
}

/**
 * Generate all context fields at once (for the "Analyze" button).
 */
export function useGenerateAllContext() {
  return useMutation({
    mutationFn: (input: { title: string; pitch: string }) =>
      generateContext({ title: input.title, pitch: input.pitch }),
  })
}

/**
 * Generate a single field (for per-field "Generate with AI" buttons).
 */
export function useGenerateField() {
  return useMutation({
    mutationFn: (input: {
      title: string
      pitch: string
      field:
        | "tags"
        | "problemStatement"
        | "targetCustomers"
        | "comparables"
        | "businessModel"
        | "marketSize"
    }) =>
      generateContext({
        title: input.title,
        pitch: input.pitch,
        fields: [input.field],
      }),
  })
}
