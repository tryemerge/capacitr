import * as readline from 'readline'
import { Facilitator, type PipelineEvent } from './facilitator'

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  white: '\x1b[37m',
}

function print(color: string, text: string) {
  console.log(`${color}${text}${COLORS.reset}`)
}

function printSeparator() {
  print(COLORS.dim, '─'.repeat(60))
}

function printState(facilitator: Facilitator) {
  const state = facilitator.getState()

  printSeparator()
  print(COLORS.bold + COLORS.cyan, '  DELIBERATION STATE')
  printSeparator()

  // Summary
  if (state.summary) {
    print(COLORS.white, '\n' + state.summary)
  }

  // Positions
  if (state.positions.length > 0) {
    print(COLORS.bold + COLORS.green, '\n  POSITIONS:')
    for (const p of state.positions) {
      print(COLORS.green, `  [${p.id}] ${p.label}`)
      print(COLORS.dim, `       ${p.description}`)
      if (p.supportingClaims.length) print(COLORS.dim, `       + ${p.supportingClaims.join(', ')}`)
      if (p.opposingClaims.length) print(COLORS.dim, `       - ${p.opposingClaims.join(', ')}`)
    }
  }

  // Open Questions
  if (state.openQuestions.length > 0) {
    print(COLORS.bold + COLORS.yellow, '\n  OPEN QUESTIONS:')
    for (const q of state.openQuestions) {
      print(COLORS.yellow, `  ? ${q}`)
    }
  }

  // Expertise Gaps
  if (state.expertiseGaps.length > 0) {
    print(COLORS.bold + COLORS.magenta, '\n  EXPERTISE GAPS:')
    for (const g of state.expertiseGaps) {
      print(COLORS.magenta, `  ! ${g}`)
    }
  }

  // Decision Menu
  if (state.decisionMenu.length > 0) {
    print(COLORS.bold + COLORS.blue, '\n  DECISION MENU:')
    for (const d of state.decisionMenu) {
      print(COLORS.blue, `  [${d.id}] ${d.label}`)
      print(COLORS.dim, `       ${d.description}`)
      if (d.pros.length) print(COLORS.green, `       + ${d.pros.join(', ')}`)
      if (d.cons.length) print(COLORS.red, `       - ${d.cons.join(', ')}`)
      if (d.unknowns.length) print(COLORS.yellow, `       ? ${d.unknowns.join(', ')}`)
    }
  }

  printSeparator()
}

async function main() {
  const args = process.argv.slice(2)
  const skipResearch = args.includes('--no-research')
  const topicArg = args.find(a => a.startsWith('--topic='))
  const topic = topicArg?.split('=')[1] || 'General discussion'

  print(COLORS.bold + COLORS.cyan, `
╔══════════════════════════════════════════════╗
║         CAPACITR FACILITATOR BOT             ║
║         Deliberation Test Harness            ║
╚══════════════════════════════════════════════╝`)

  print(COLORS.dim, `
  Topic: ${topic}
  Research: ${skipResearch ? 'OFF (--no-research)' : 'ON'}

  Commands:
    author: message    Send a message as "author"
    /state             Show current deliberation state
    /claims            Show all extracted claims
    /research          Show all research results
    /quit              Exit

  Example:
    alice: We should migrate our contracts to Arbitrum
    bob: I disagree, the bridge security risks are too high
`)

  const facilitator = new Facilitator({
    topic,
    skipResearch,
    maxResearchPerMessage: 2,
    onEvent: (event: PipelineEvent) => {
      switch (event.type) {
        case 'message_received':
          print(COLORS.white, `\n  [+] Message from ${event.message.author}: "${event.message.content.slice(0, 80)}${event.message.content.length > 80 ? '...' : ''}"`)
          break
        case 'extraction_start':
          print(COLORS.dim, '  [...] Extracting claims...')
          break
        case 'claim_added':
          print(COLORS.cyan, `  [claim] (${event.claim.type}) ${event.claim.statement}`)
          break
        case 'gaps_found':
          print(COLORS.magenta, `  [gaps] ${event.gaps.join(', ')}`)
          break
        case 'extraction_complete':
          print(COLORS.green, `  [done] ${event.result.claims.length} claim(s) extracted, novel: ${event.result.isNovel}`)
          break
        case 'research_start':
          print(COLORS.dim, `  [...] Researching ${event.count} factual claim(s)...`)
          break
        case 'research_claim_complete': {
          const color = event.result.verdict === 'supported' ? COLORS.green
            : event.result.verdict === 'contradicted' ? COLORS.red
            : COLORS.yellow
          print(color, `  [research] ${event.result.claimId}: ${event.result.verdict} — ${event.result.findings.slice(0, 100)}`)
          break
        }
        case 'research_skipped':
          print(COLORS.dim, '  [skip] Research disabled')
          break
        case 'synthesis_start':
          print(COLORS.dim, '  [...] Synthesizing...')
          break
        case 'synthesis_complete':
          print(COLORS.green, '  [done] Synthesis complete')
          break
        case 'error':
          print(COLORS.red, `  [error] ${event.stage}: ${event.error}`)
          break
      }
    },
  })

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${COLORS.cyan}> ${COLORS.reset}`,
  })

  rl.prompt()

  rl.on('line', async (line) => {
    const input = line.trim()

    if (!input) {
      rl.prompt()
      return
    }

    // Commands
    if (input === '/quit' || input === '/exit') {
      print(COLORS.dim, 'Goodbye.')
      process.exit(0)
    }

    if (input === '/state') {
      printState(facilitator)
      rl.prompt()
      return
    }

    if (input === '/claims') {
      const state = facilitator.getState()
      if (state.claims.length === 0) {
        print(COLORS.dim, '  No claims yet.')
      } else {
        for (const c of state.claims) {
          print(COLORS.white, `  [${c.id}] (${c.type}) ${c.statement}`)
          if (c.reason) print(COLORS.dim, `    reason: ${c.reason}`)
          if (c.assumptions.length) print(COLORS.dim, `    assumes: ${c.assumptions.join(', ')}`)
        }
      }
      rl.prompt()
      return
    }

    if (input === '/research') {
      const state = facilitator.getState()
      if (state.researchResults.length === 0) {
        print(COLORS.dim, '  No research results yet.')
      } else {
        for (const r of state.researchResults) {
          const color = r.verdict === 'supported' ? COLORS.green
            : r.verdict === 'contradicted' ? COLORS.red
            : COLORS.yellow
          print(color, `  [${r.claimId}] ${r.verdict}: ${r.findings}`)
          if (r.sources.length) print(COLORS.dim, `    sources: ${r.sources.join(', ')}`)
        }
      }
      rl.prompt()
      return
    }

    // Parse message: "author: content"
    const colonIndex = input.indexOf(':')
    if (colonIndex === -1) {
      print(COLORS.red, '  Format: author: message')
      print(COLORS.dim, '  Example: alice: We should use Rust for the rewrite')
      rl.prompt()
      return
    }

    const author = input.slice(0, colonIndex).trim()
    const content = input.slice(colonIndex + 1).trim()

    if (!author || !content) {
      print(COLORS.red, '  Both author and message are required.')
      rl.prompt()
      return
    }

    try {
      console.log()
      const result = await facilitator.addMessage(author, content)

      // Print synthesis
      console.log()
      printState(facilitator)
      console.log()
    } catch (err) {
      print(COLORS.red, `  Error: ${err instanceof Error ? err.message : String(err)}`)
    }

    rl.prompt()
  })

  rl.on('close', () => {
    print(COLORS.dim, '\nGoodbye.')
    process.exit(0)
  })
}

main().catch(console.error)
