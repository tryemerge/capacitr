import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const requestSchema = z.object({
  title: z.string().min(1),
  pitch: z.string().optional().default(""),
})

const responseSchema = z.object({
  ticker: z.string().min(3).max(5).regex(/^[A-Z]+$/),
  alternatives: z.array(z.string().min(3).max(5).regex(/^[A-Z]+$/)),
})

export type GenerateTickerRequest = z.infer<typeof requestSchema>
export type GenerateTickerResponse = z.infer<typeof responseSchema>

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
          temperature: 0.9,
          maxOutputTokens: 256,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, pitch } = requestSchema.parse(body)

    const prompt = `You are a creative branding expert for crypto/web3 projects.

Given this project:
- Title: "${title}"
${pitch ? `- Pitch: "${pitch}"` : ""}

Generate token ticker symbols. Rules:
- Each ticker must be 3-5 UPPERCASE letters only (A-Z, no numbers or symbols)
- Should be memorable, catchy, and relevant to the project
- Think like $DOGE, $PEPE, $UNI, $AAVE — short, punchy, brandable
- Avoid existing well-known tickers (BTC, ETH, SOL, USDT, USDC, etc.)

Return JSON with:
- "ticker": your top recommended ticker (string, 3-5 uppercase letters)
- "alternatives": array of 3 other good options (each 3-5 uppercase letters)

Return ONLY JSON. No markdown, no explanation.`

    const raw = await callGemini(prompt)
    const parsed = JSON.parse(raw)

    // Validate and sanitize
    const clean = (s: string) => s.replace(/[^A-Z]/g, "").slice(0, 5)
    const ticker = clean(String(parsed.ticker ?? ""))
    const alternatives = (parsed.alternatives ?? [])
      .map((t: unknown) => clean(String(t)))
      .filter((t: string) => t.length >= 3 && t !== ticker)
      .slice(0, 3)

    if (ticker.length < 3) {
      throw new Error("AI returned invalid ticker")
    }

    const validated = responseSchema.parse({ ticker, alternatives })
    return NextResponse.json(validated)
  } catch (err: any) {
    console.error("AI generate-ticker error:", err)
    return NextResponse.json(
      { error: err.message ?? "Failed to generate ticker" },
      { status: 500 }
    )
  }
}
