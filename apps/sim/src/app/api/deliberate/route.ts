import { NextRequest } from 'next/server'
import { Facilitator, type PipelineEvent, type DeliberationState } from '@capacitr/facilitator'

// In-memory session store (single-process; fine for dev)
const sessions = new Map<string, Facilitator>()

function getOrCreate(sessionId: string, topic: string, skipResearch: boolean): Facilitator {
  let f = sessions.get(sessionId)
  if (!f) {
    f = new Facilitator({ topic, skipResearch, maxResearchPerMessage: 2 })
    sessions.set(sessionId, f)
  }
  return f
}

/**
 * POST /api/deliberate
 * Body: { sessionId, topic, author, content, skipResearch? }
 * Returns SSE stream of pipeline events.
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { sessionId = 'default', topic = 'General discussion', author, content, skipResearch = false } = body

  if (!author || !content) {
    return new Response(JSON.stringify({ error: 'author and content are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const facilitator = getOrCreate(sessionId, topic, skipResearch)

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: PipelineEvent) {
        const data = JSON.stringify(event)
        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
      }

      const unsub = facilitator.on(send)

      try {
        await facilitator.addMessage(author, content)
        // Send final state
        send({ type: 'state_updated', state: facilitator.getState() })
      } catch (err) {
        send({
          type: 'error',
          stage: 'pipeline',
          error: err instanceof Error ? err.message : String(err),
        })
      } finally {
        unsub()
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

/**
 * GET /api/deliberate?sessionId=xxx
 * Returns current deliberation state.
 */
export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('sessionId') || 'default'
  const f = sessions.get(sessionId)

  if (!f) {
    const empty: DeliberationState = {
      topic: '',
      messages: [],
      claims: [],
      researchResults: [],
      positions: [],
      openQuestions: [],
      expertiseGaps: [],
      summary: '',
      decisionMenu: [],
    }
    return new Response(JSON.stringify(empty), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(f.getState()), {
    headers: { 'Content-Type': 'application/json' },
  })
}
