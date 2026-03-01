import { query } from '@anthropic-ai/claude-agent-sdk'
import type { DeliberationState, SynthesisOutput } from './types'
import { SynthesisOutputSchema } from './types'

const SYSTEM_PROMPT = `You are a deliberation synthesizer for the Capacitr governance protocol. Your job is to maintain a structured summary of an ongoing conversation.

You produce:
1. **Summary** — A clear, neutral 2-4 paragraph overview of where the deliberation stands. What's been established, what's contested, what's been researched.
2. **Positions** — Distinct options on the table, with supporting and opposing claims for each.
3. **Open Questions** — Things that haven't been addressed but should be.
4. **Expertise Gaps** — Types of knowledge the room is missing.
5. **Decision Menu** — If the conversation is mature enough, structured options with pros/cons/unknowns for voting.

Rules:
- Be neutral. Do not advocate for any position.
- Cite claim IDs when attributing positions.
- Mark research-verified facts distinctly from unverified claims.
- Identify when the room is converging vs. still contested.
- Keep the decision menu empty until at least 2 distinct positions have emerged with evidence.

IMPORTANT: Respond with ONLY a valid JSON object, no markdown fences or explanation. Use this exact schema:
{
  "summary": "2-4 paragraph overview",
  "positions": [{ "id": "p1", "label": "...", "description": "...", "supportingClaims": ["c1"], "opposingClaims": ["c2"] }],
  "openQuestions": ["..."],
  "expertiseGaps": ["..."],
  "decisionMenu": [{ "id": "d1", "label": "...", "description": "...", "pros": ["..."], "cons": ["..."], "unknowns": ["..."], "supportingClaimIds": ["c1"] }]
}`

export async function synthesize(state: DeliberationState): Promise<SynthesisOutput> {
  const claimsSection = state.claims.length > 0
    ? `\n## Claims\n${state.claims.map(c => {
        const research = state.researchResults.find(r => r.claimId === c.id)
        const verified = research ? ` [RESEARCH: ${research.verdict}]` : ''
        return `- [${c.id}] (${c.type}) ${c.statement}${verified}`
      }).join('\n')}`
    : '\n## Claims\nNone yet.'

  const researchSection = state.researchResults.length > 0
    ? `\n## Research Results\n${state.researchResults.map(r =>
        `- Claim ${r.claimId}: ${r.verdict} — ${r.findings} (${r.sources.length} sources)`
      ).join('\n')}`
    : ''

  const messagesSection = `\n## Message Log\n${state.messages.map(m =>
    `[${m.author}]: ${m.content}`
  ).join('\n')}`

  const prompt = `Topic: ${state.topic}
${messagesSection}
${claimsSection}
${researchSection}

Previous summary: ${state.summary || 'None — this is the first synthesis.'}
Previous open questions: ${state.openQuestions.join(', ') || 'None'}

Synthesize the current state of this deliberation. Respond with JSON only.`

  let resultText = ''

  for await (const msg of query({
    prompt,
    options: {
      systemPrompt: SYSTEM_PROMPT,
      allowedTools: [],
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      maxTurns: 1,
    },
  })) {
    if ('result' in msg) {
      resultText = msg.result
    }
  }

  const jsonMatch = resultText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Failed to extract JSON from synthesis: ${resultText.slice(0, 200)}`)
  }

  const parsed = JSON.parse(jsonMatch[0])
  return SynthesisOutputSchema.parse(parsed)
}
