import { query } from '@anthropic-ai/claude-agent-sdk'
import type { Message, Claim, ExtractionResult } from './types'
import { ExtractionResultSchema } from './types'

const SYSTEM_PROMPT = `You are a claim extractor for a structured deliberation protocol. Your job is to parse participant messages into structured claims.

For each message, extract:
1. **Claims** — distinct assertions, proposals, rebuttals, reframes, or supporting evidence
2. **Novelty** — whether this message adds information not already in the conversation
3. **Gaps** — what expertise or information is revealed to be missing

Claim types:
- factual: a verifiable statement about the world ("Arbitrum fees average $0.08")
- proposal: a suggested course of action ("We should migrate to L2")
- rebuttal: a counter to a previous claim ("Migration won't help because...")
- reframe: redefines the problem ("The real issue isn't fees, it's...")
- supporting: evidence or reasoning backing another claim

Be precise. One message may contain zero claims (noise) or many. Each claim should be a single atomic assertion. Assign sequential IDs like "c1", "c2", etc.

IMPORTANT: Respond with ONLY a valid JSON object, no markdown fences or explanation. Use this exact schema:
{
  "claims": [{ "id": "c1", "type": "factual|proposal|rebuttal|reframe|supporting", "statement": "...", "reason": "...", "evidence": "...", "assumptions": ["..."], "referencesClaimId": "c0" }],
  "isNovel": true,
  "suggestedGaps": ["expertise or info that is missing"]
}`

export async function extractClaims(
  message: Message,
  existingClaims: Claim[],
  topic: string,
): Promise<ExtractionResult> {
  const claimContext = existingClaims.length > 0
    ? `\n\nExisting claims in this deliberation:\n${existingClaims.map(c => `- [${c.id}] (${c.type}) ${c.statement}`).join('\n')}`
    : ''

  const nextId = existingClaims.length + 1

  const prompt = `Topic: ${topic}${claimContext}

New message from "${message.author}":
"${message.content}"

Extract claims. Start IDs from c${nextId}. Respond with JSON only.`

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
    throw new Error(`Failed to extract JSON from response: ${resultText.slice(0, 200)}`)
  }

  const parsed = JSON.parse(jsonMatch[0])
  return ExtractionResultSchema.parse(parsed)
}
