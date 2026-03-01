import { extractClaims } from './extractor'
import { planResearch, researchAll } from './researcher'
import { synthesize } from './synthesizer'
import type { Message, Claim, ResearchResult, DeliberationState, SynthesisOutput, ExtractionResult } from './types'

// --- Pipeline Events ---

export type PipelineEvent =
  | { type: 'message_received'; message: Message }
  | { type: 'extraction_start' }
  | { type: 'extraction_complete'; result: ExtractionResult }
  | { type: 'claim_added'; claim: Claim }
  | { type: 'gaps_found'; gaps: string[] }
  | { type: 'research_start'; count: number }
  | { type: 'research_claim_start'; claimId: string; query: string }
  | { type: 'research_claim_complete'; result: ResearchResult }
  | { type: 'research_skipped' }
  | { type: 'synthesis_start' }
  | { type: 'synthesis_complete'; result: SynthesisOutput }
  | { type: 'state_updated'; state: DeliberationState }
  | { type: 'error'; stage: string; error: string }
  | { type: 'log'; message: string }

export type EventListener = (event: PipelineEvent) => void

export interface FacilitatorConfig {
  topic: string
  /** Skip research for faster iteration during testing */
  skipResearch?: boolean
  /** Max research tasks per message */
  maxResearchPerMessage?: number
  /** Callback when state changes */
  onStateChange?: (state: DeliberationState) => void
  /** Event listener for pipeline streaming */
  onEvent?: EventListener
}

export class Facilitator {
  private state: DeliberationState
  private config: FacilitatorConfig
  private messageCounter = 0
  private listeners: EventListener[] = []

  constructor(config: FacilitatorConfig) {
    this.config = config
    if (config.onEvent) {
      this.listeners.push(config.onEvent)
    }
    this.state = {
      topic: config.topic,
      messages: [],
      claims: [],
      researchResults: [],
      positions: [],
      openQuestions: [],
      expertiseGaps: [],
      summary: '',
      decisionMenu: [],
    }
  }

  on(listener: EventListener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Process a new message through the full pipeline:
   * extract → research → synthesize
   */
  async addMessage(author: string, content: string): Promise<{
    extraction: ExtractionResult
    research: ResearchResult[]
    synthesis: SynthesisOutput
  }> {
    const message: Message = {
      id: `m${++this.messageCounter}`,
      author,
      content,
      timestamp: Date.now(),
    }

    this.state.messages.push(message)
    this.fire({ type: 'message_received', message })

    // 1. Extract claims
    this.fire({ type: 'extraction_start' })
    const extraction = await extractClaims(message, this.state.claims, this.state.topic)
    this.fire({ type: 'extraction_complete', result: extraction })

    for (const claim of extraction.claims) {
      this.state.claims.push(claim)
      this.fire({ type: 'claim_added', claim })
    }

    if (extraction.suggestedGaps.length > 0) {
      this.state.expertiseGaps.push(...extraction.suggestedGaps)
      this.fire({ type: 'gaps_found', gaps: extraction.suggestedGaps })
    }

    // 2. Research factual claims
    let researchResults: ResearchResult[] = []
    if (!this.config.skipResearch) {
      const tasks = planResearch(extraction.claims)
        .slice(0, this.config.maxResearchPerMessage ?? 3)

      if (tasks.length > 0) {
        this.fire({ type: 'research_start', count: tasks.length })
        researchResults = await researchAll(tasks)

        for (const result of researchResults) {
          this.state.researchResults.push(result)
          this.fire({ type: 'research_claim_complete', result })
        }
      }
    } else {
      this.fire({ type: 'research_skipped' })
    }

    // 3. Synthesize
    this.fire({ type: 'synthesis_start' })
    const synthesis = await synthesize(this.state)
    this.fire({ type: 'synthesis_complete', result: synthesis })

    this.state.summary = synthesis.summary
    this.state.positions = synthesis.positions.map(p => ({ ...p, votes: 0 }))
    this.state.openQuestions = synthesis.openQuestions
    this.state.expertiseGaps = synthesis.expertiseGaps
    this.state.decisionMenu = synthesis.decisionMenu

    this.fire({ type: 'state_updated', state: { ...this.state } })
    this.config.onStateChange?.(this.state)

    return { extraction, research: researchResults, synthesis }
  }

  getState(): DeliberationState {
    return { ...this.state }
  }

  private fire(event: PipelineEvent) {
    for (const listener of this.listeners) {
      try { listener(event) } catch { /* don't let listener errors break the pipeline */ }
    }
  }
}
