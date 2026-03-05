/**
 * Orchestration agent — reviews work submissions against a project's system prompt.
 *
 * Uses Claude API (or Claude Agent SDK when available) to evaluate work proof
 * and return a decision: approve, reject, or route to snap poll.
 *
 * This is the mock/local version. In production, this would use the Agent SDK
 * via `packages/facilitator`.
 */

export interface ReviewInput {
  systemPrompt: string;
  proofContent: string;
  tokenAsk: number;
  maxTokenAsk?: number;
  autoApproveThreshold?: number;
  autoRejectThreshold?: number;
}

export interface ReviewResult {
  decision: "approved" | "rejected" | "snap_poll";
  confidence: number;
  reasoning: string;
}

/**
 * Review a work submission. In mock mode, uses simple heuristics.
 * When ANTHROPIC_API_KEY is set, delegates to Claude.
 */
export async function reviewSubmission(input: ReviewInput): Promise<ReviewResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    return reviewWithClaude(input, apiKey);
  }

  return reviewMock(input);
}

async function reviewWithClaude(
  input: ReviewInput,
  apiKey: string,
): Promise<ReviewResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: input.systemPrompt,
      messages: [
        {
          role: "user",
          content: `Review this work submission and respond with JSON only:

Proof of work:
${input.proofContent}

Token ask: ${input.tokenAsk}
Max allowed: ${input.maxTokenAsk ?? "unlimited"}

Respond with exactly this JSON format:
{"decision": "approved" | "rejected" | "snap_poll", "confidence": 0.0-1.0, "reasoning": "brief explanation"}

Decision rules:
- "approved" if the work is clearly valid and the token ask is reasonable
- "rejected" if the work is clearly invalid, low-effort, or the ask is unreasonable
- "snap_poll" if you're uncertain and want community input`,
        },
      ],
    }),
  });

  if (!res.ok) {
    // Fall back to mock on API error
    return reviewMock(input);
  }

  const data = await res.json();
  const text = data.content?.[0]?.text ?? "";

  try {
    const parsed = JSON.parse(text);
    return {
      decision: parsed.decision ?? "snap_poll",
      confidence: parsed.confidence ?? 0.5,
      reasoning: parsed.reasoning ?? "AI review completed",
    };
  } catch {
    return reviewMock(input);
  }
}

function reviewMock(input: ReviewInput): ReviewResult {
  // Simple heuristic: check proof length and token ask
  const proofLength = input.proofContent.trim().length;
  const maxAsk = input.maxTokenAsk ?? 1000;
  const approveThreshold = input.autoApproveThreshold ?? 0.8;
  const rejectThreshold = input.autoRejectThreshold ?? 0.2;

  let confidence = 0.5;

  // Longer proof = more confidence
  if (proofLength > 200) confidence += 0.2;
  if (proofLength > 500) confidence += 0.1;
  if (proofLength < 50) confidence -= 0.3;

  // Reasonable token ask = more confidence
  if (input.tokenAsk <= maxAsk * 0.5) confidence += 0.1;
  if (input.tokenAsk > maxAsk) confidence -= 0.3;

  confidence = Math.max(0, Math.min(1, confidence));

  let decision: ReviewResult["decision"];
  if (confidence >= approveThreshold) {
    decision = "approved";
  } else if (confidence <= rejectThreshold) {
    decision = "rejected";
  } else {
    decision = "snap_poll";
  }

  return {
    decision,
    confidence,
    reasoning: `Mock review: proof length ${proofLength} chars, token ask ${input.tokenAsk}/${maxAsk}, confidence ${confidence.toFixed(2)}`,
  };
}
