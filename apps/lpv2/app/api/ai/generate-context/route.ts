import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// ── Request / Response Schemas ──────────────────────────────────

const requestSchema = z.object({
  title: z.string().min(1),
  pitch: z.string().min(1),
  /** Which fields to generate. Omit to generate all. */
  fields: z
    .array(
      z.enum([
        "tags",
        "problemStatement",
        "targetCustomers",
        "comparables",
        "businessModel",
        "marketSize",
      ])
    )
    .optional(),
})

const comparableSchema = z.object({
  name: z.string(),
  url: z.string(),
  description: z.string(),
})

const responseSchema = z.object({
  tags: z.array(z.string()).optional(),
  problemStatement: z.string().optional(),
  targetCustomers: z.string().optional(),
  comparables: z.array(comparableSchema).optional(),
  businessModel: z.string().optional(),
  marketSize: z.string().optional(),
})

export type GenerateContextRequest = z.infer<typeof requestSchema>
export type GenerateContextResponse = z.infer<typeof responseSchema>

// ── Constants ───────────────────────────────────────────────────

const AVAILABLE_TAGS = [
  "AI/ML", "Developer Tools", "B2B SaaS", "Web3", "DeFi", "NFTs",
  "Marketplace", "Fintech", "Consumer", "Enterprise", "Infrastructure",
  "Healthcare", "Climate", "Gaming", "Social", "Creator Economy",
  "Ecommerce", "Energy", "Music", "Investing",
]

const BUSINESS_MODELS = [
  "SaaS subscription", "Marketplace transaction fees", "Freemium + premium",
  "Ad-supported", "Token-native economics", "Enterprise licensing",
  "Ecommerce", "Professional Services", "Custom / Other",
]

// ── Fallback Data ───────────────────────────────────────────────

const FALLBACK_SETS: GenerateContextResponse[] = [
  {
    tags: ["AI/ML", "Developer Tools", "B2B SaaS"],
    problemStatement:
      "Teams waste hours each week on repetitive workflows that could be automated. Current tools are fragmented, expensive, and require deep technical expertise to set up — leaving most organizations stuck with manual processes that slow them down.",
    targetCustomers:
      "Primary: Mid-market technology companies (100–1,000 employees) with growing engineering and ops teams. Secondary: Early-stage startups that need to move fast but lack dedicated DevOps or automation resources.",
    comparables: [
      { name: "Zapier", url: "https://zapier.com", description: "Workflow automation for non-technical users across thousands of apps" },
      { name: "Retool", url: "https://retool.com", description: "Low-code platform for building internal tools quickly" },
      { name: "Temporal", url: "https://temporal.io", description: "Durable workflow orchestration for developers" },
    ],
    businessModel: "SaaS subscription",
    marketSize:
      "TAM: $25B global workflow automation market growing at 23% CAGR. SAM: $6B for mid-market B2B automation. SOM: $300M achievable within 3 years by capturing developer-first segment.",
  },
  {
    tags: ["Web3", "Infrastructure", "DeFi"],
    problemStatement:
      "Decentralized applications still suffer from poor UX, slow transaction finality, and fragmented tooling. Builders spend more time wrangling infrastructure than shipping features, and end users face confusing wallet flows that kill adoption.",
    targetCustomers:
      "Primary: Web3 development teams building consumer-facing dApps who need reliable infrastructure. Secondary: Traditional fintech companies exploring on-chain settlement and tokenized assets.",
    comparables: [
      { name: "Alchemy", url: "https://alchemy.com", description: "Leading blockchain developer platform and node infrastructure provider" },
      { name: "Privy", url: "https://privy.io", description: "Embedded wallet and auth toolkit that simplifies Web3 onboarding" },
      { name: "Uniswap", url: "https://uniswap.org", description: "Pioneered automated market making and on-chain token trading" },
    ],
    businessModel: "Token-native economics",
    marketSize:
      "TAM: $65B blockchain infrastructure market by 2027. SAM: $8B developer tooling and middleware layer. SOM: $400M by focusing on EVM-compatible L2 ecosystems in the first 2 years.",
  },
]

function pickFallback(title: string): GenerateContextResponse {
  const web3Keywords = ["web3", "blockchain", "crypto", "defi", "token", "nft", "dao", "chain", "wallet", "onchain"]
  const isWeb3 = web3Keywords.some((kw) => title.toLowerCase().includes(kw))
  return FALLBACK_SETS[isWeb3 ? 1 : 0]
}

function filterFallback(
  fallback: GenerateContextResponse,
  fields: string[]
): GenerateContextResponse {
  const result: GenerateContextResponse = {}
  if (fields.includes("tags")) result.tags = fallback.tags
  if (fields.includes("problemStatement")) result.problemStatement = fallback.problemStatement
  if (fields.includes("targetCustomers")) result.targetCustomers = fallback.targetCustomers
  if (fields.includes("comparables")) result.comparables = fallback.comparables
  if (fields.includes("businessModel")) result.businessModel = fallback.businessModel
  if (fields.includes("marketSize")) result.marketSize = fallback.marketSize
  return result
}

// ── Gemini Call ─────────────────────────────────────────────────

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) throw new Error("GOOGLE_API_KEY not configured")

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          responseMimeType: "application/json",
        },
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
}

// ── Route Handler ───────────────────────────────────────────────

const ALL_FIELDS = [
  "tags", "problemStatement", "targetCustomers",
  "comparables", "businessModel", "marketSize",
] as const

export async function POST(req: NextRequest) {
  let title = ""
  let requestedFields: string[] = [...ALL_FIELDS]

  try {
    const body = await req.json()
    const input = requestSchema.parse(body)
    title = input.title
    const pitch = input.pitch
    requestedFields = input.fields ?? [...ALL_FIELDS]

    const prompt = `You are a startup analyst helping founders flesh out their idea submission on a launchpad platform.

Given this idea:
- Title: "${title}"
- Pitch: "${pitch}"

Generate the following fields as JSON. Be specific, actionable, and concise.

${requestedFields.includes("tags") ? `"tags": Pick 2-4 most relevant tags from this exact list: ${JSON.stringify(AVAILABLE_TAGS)}. Return only tags from this list.` : ""}

${requestedFields.includes("problemStatement") ? `"problemStatement": A compelling 2-3 sentence problem statement explaining what pain point this solves and why it matters. Max 500 chars.` : ""}

${requestedFields.includes("targetCustomers") ? `"targetCustomers": Describe the primary and secondary target customer segments in 2-3 sentences. Be specific about company size, industry, and user persona. Max 500 chars.` : ""}

${requestedFields.includes("comparables") ? `"comparables": An array of 2-3 real comparable companies. Each has "name" (string), "url" (valid URL), "description" (1 sentence on why they're comparable). Only use real companies.` : ""}

${requestedFields.includes("businessModel") ? `"businessModel": Pick the single best fit from this list: ${JSON.stringify(BUSINESS_MODELS)}. Return only one value from this list.` : ""}

${requestedFields.includes("marketSize") ? `"marketSize": A TAM/SAM/SOM analysis in 2-3 sentences with realistic dollar figures. Max 500 chars.` : ""}

Return ONLY a JSON object with the requested fields. No markdown, no explanation.`

    const raw = await callGemini(prompt)
    const parsed = JSON.parse(raw)

    // Validate and clamp the response
    const validated = responseSchema.parse({
      ...(requestedFields.includes("tags") && parsed.tags
        ? { tags: parsed.tags.filter((t: string) => AVAILABLE_TAGS.includes(t)).slice(0, 5) }
        : {}),
      ...(requestedFields.includes("problemStatement") && parsed.problemStatement
        ? { problemStatement: String(parsed.problemStatement).slice(0, 2000) }
        : {}),
      ...(requestedFields.includes("targetCustomers") && parsed.targetCustomers
        ? { targetCustomers: String(parsed.targetCustomers).slice(0, 2000) }
        : {}),
      ...(requestedFields.includes("comparables") && parsed.comparables
        ? { comparables: parsed.comparables.slice(0, 5) }
        : {}),
      ...(requestedFields.includes("businessModel") && parsed.businessModel
        ? {
            businessModel: BUSINESS_MODELS.includes(parsed.businessModel)
              ? parsed.businessModel
              : "Custom / Other",
          }
        : {}),
      ...(requestedFields.includes("marketSize") && parsed.marketSize
        ? { marketSize: String(parsed.marketSize).slice(0, 2000) }
        : {}),
    })

    return NextResponse.json(validated)
  } catch (err: any) {
    console.error("AI generate-context error (returning fallback):", err?.message)

    const fallback = filterFallback(pickFallback(title), requestedFields)
    return NextResponse.json(fallback)
  }
}
