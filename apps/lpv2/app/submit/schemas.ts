import { z } from "zod"

// ---------------------------------------------------------------------------
// Shared schemas (imported by both actions.ts and page.tsx)
// ---------------------------------------------------------------------------

export const comparableSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  url: z.string().url("Must be a valid URL").or(z.literal("")),
  description: z.string(),
})

// ---- Step 1: Basics ----

export const basicsSchema = z.object({
  draftId: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(80, "Title must be 80 characters or fewer"),
  pitch: z
    .string()
    .min(1, "Pitch is required")
    .max(140, "Pitch must be 140 characters or fewer"),
  tokenTicker: z
    .string()
    .min(3, "Ticker must be 3–5 uppercase letters")
    .max(5, "Ticker must be 3–5 uppercase letters")
    .regex(/^[A-Z]+$/, "Only uppercase letters allowed"),
  tags: z
    .array(z.string())
    .min(1, "Select at least 1 category")
    .max(5, "Select up to 5 categories"),
})

export type BasicsPayload = z.infer<typeof basicsSchema>

// ---- Step 2: Context ----

export const contextSchema = z.object({
  draftId: z.string().min(1, "Draft ID is required"),
  problemStatement: z.string().max(2000).optional().default(""),
  targetCustomers: z.string().max(2000).optional().default(""),
  comparables: z.array(comparableSchema).max(5).optional().default([]),
  businessModel: z.string().optional().default(""),
  marketSize: z.string().max(2000).optional().default(""),
  briefsAndMemos: z.string().optional().default(""),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
})

export type ContextPayload = z.infer<typeof contextSchema>

// ---- Step 3: Final submit ----

export const submitSchema = z.object({
  draftId: z.string().min(1, "Draft ID is required"),
  // Basics
  title: basicsSchema.shape.title,
  pitch: basicsSchema.shape.pitch,
  tokenTicker: basicsSchema.shape.tokenTicker,
  tags: basicsSchema.shape.tags,
  // Context
  problemStatement: contextSchema.shape.problemStatement,
  targetCustomers: contextSchema.shape.targetCustomers,
  comparables: contextSchema.shape.comparables,
  businessModel: contextSchema.shape.businessModel,
  marketSize: contextSchema.shape.marketSize,
  briefsAndMemos: contextSchema.shape.briefsAndMemos,
  coverImageUrl: contextSchema.shape.coverImageUrl,
  // On-chain reference (set after launchIdea tx)
  txHash: z.string().optional(),
})

export type SubmitPayload = z.infer<typeof submitSchema>
