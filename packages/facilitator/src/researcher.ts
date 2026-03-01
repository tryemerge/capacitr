import { query } from '@anthropic-ai/claude-agent-sdk'
import type { Claim, ResearchTask, ResearchResult } from './types'

/**
 * Identify which claims need research (factual claims only).
 */
export function planResearch(claims: Claim[]): ResearchTask[] {
  return claims
    .filter(c => c.type === 'factual')
    .map(c => ({
      claimId: c.id,
      query: c.statement,
      priority: 'high' as const,
    }))
}

/**
 * Research a single claim using the Agent SDK.
 * Uses WebSearch + WebFetch to find supporting or contradicting evidence.
 */
export async function researchClaim(task: ResearchTask): Promise<ResearchResult> {
  const prompt = `You are a fact-checker for a deliberation protocol. Research this claim and determine if it is supported, contradicted, or inconclusive.

Claim: "${task.query}"

Instructions:
1. Search the web for current, authoritative data on this claim
2. Look for multiple sources to corroborate or contradict
3. Be specific about numbers, dates, and sources
4. If the claim is about a specific technology, protocol, or system — check official docs

Respond with ONLY a JSON object (no markdown, no code fences) in this exact format:
{
  "findings": "A 2-3 sentence summary of what you found",
  "verdict": "supported" | "contradicted" | "inconclusive" | "no_data",
  "sources": ["url1", "url2"]
}`

  let resultText = ''

  try {
    for await (const message of query({
      prompt,
      options: {
        allowedTools: ['WebSearch', 'WebFetch'],
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        maxTurns: 8,
        systemPrompt: 'You are a research agent. Use web search to fact-check claims. Return structured JSON results.',
      },
    })) {
      if ('result' in message) {
        resultText = message.result
      }
    }
  } catch (err) {
    console.error(`[research] Error researching claim ${task.claimId}:`, err)
    return {
      claimId: task.claimId,
      query: task.query,
      findings: 'Research failed due to an error.',
      verdict: 'no_data',
      sources: [],
    }
  }

  // Parse the agent's response
  try {
    // Try to extract JSON from the response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        claimId: task.claimId,
        query: task.query,
        findings: parsed.findings || resultText,
        verdict: parsed.verdict || 'inconclusive',
        sources: parsed.sources || [],
      }
    }
  } catch {
    // JSON parse failed, use raw text
  }

  return {
    claimId: task.claimId,
    query: task.query,
    findings: resultText || 'No findings.',
    verdict: 'inconclusive',
    sources: [],
  }
}

/**
 * Research all tasks, running them with concurrency control.
 */
export async function researchAll(
  tasks: ResearchTask[],
  concurrency = 2,
): Promise<ResearchResult[]> {
  const results: ResearchResult[] = []

  // Process in batches
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency)
    const batchResults = await Promise.all(batch.map(researchClaim))
    results.push(...batchResults)
  }

  return results
}
