import { z } from 'zod'

// --- Input ---

export interface Message {
  id: string
  author: string
  content: string
  timestamp: number
}

// --- Claim Extraction ---

export const ClaimTypeSchema = z.enum([
  'factual',       // verifiable statement about the world
  'proposal',      // suggested course of action
  'rebuttal',      // counter to a previous claim
  'reframe',       // redefines the problem or shifts perspective
  'supporting',    // evidence or reasoning backing another claim
])
export type ClaimType = z.infer<typeof ClaimTypeSchema>

export const ClaimSchema = z.object({
  id: z.string(),
  type: z.enum(['factual', 'proposal', 'rebuttal', 'reframe', 'supporting']),
  statement: z.string().describe('The core claim in a single sentence'),
  reason: z.string().optional().describe('Why the author believes this'),
  evidence: z.string().optional().describe('Any evidence cited'),
  assumptions: z.array(z.string()).describe('Implicit assumptions'),
  referencesClaimId: z.string().optional().describe('ID of claim this responds to'),
})
export type Claim = z.infer<typeof ClaimSchema>

export const ExtractionResultSchema = z.object({
  claims: z.array(ClaimSchema),
  isNovel: z.boolean().describe('Does this message add new information?'),
  suggestedGaps: z.array(z.string()).describe('Expertise or info the message reveals is missing'),
})
export type ExtractionResult = z.infer<typeof ExtractionResultSchema>

// --- Research ---

export interface ResearchTask {
  claimId: string
  query: string
  priority: 'high' | 'medium' | 'low'
}

export interface ResearchResult {
  claimId: string
  query: string
  findings: string
  verdict: 'supported' | 'contradicted' | 'inconclusive' | 'no_data'
  sources: string[]
}

// --- Deliberation State ---

export interface Position {
  id: string
  label: string
  description: string
  supportingClaims: string[]
  opposingClaims: string[]
  votes: number
}

export interface DeliberationState {
  topic: string
  messages: Message[]
  claims: Claim[]
  researchResults: ResearchResult[]
  positions: Position[]
  openQuestions: string[]
  expertiseGaps: string[]
  summary: string
  decisionMenu: DecisionOption[]
}

export interface DecisionOption {
  id: string
  label: string
  description: string
  pros: string[]
  cons: string[]
  unknowns: string[]
  supportingClaimIds: string[]
}

// --- Synthesis Output ---

export const SynthesisOutputSchema = z.object({
  summary: z.string().describe('Current state of the deliberation in 2-4 paragraphs'),
  positions: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    supportingClaims: z.array(z.string()),
    opposingClaims: z.array(z.string()),
  })),
  openQuestions: z.array(z.string()),
  expertiseGaps: z.array(z.string()),
  decisionMenu: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    pros: z.array(z.string()),
    cons: z.array(z.string()),
    unknowns: z.array(z.string()),
    supportingClaimIds: z.array(z.string()),
  })),
})
export type SynthesisOutput = z.infer<typeof SynthesisOutputSchema>
