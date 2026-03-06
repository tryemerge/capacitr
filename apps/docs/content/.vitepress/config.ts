import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  title: 'Capacitor',
  description: 'Participation economics that compound. Launchpad-first today, coordination layer next.',

  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'stylesheet', href: '/css/styles.css' }],
  ],

  mermaid: {
    theme: 'dark',
    securityLevel: 'loose',
    startOnLoad: true,
    maxTextSize: 50000,
    flowchart: {
      useMaxWidth: true,
      htmlLabels: true,
    },
  },

  vite: {
    optimizeDeps: {
      include: ['mermaid'],
    },
    ssr: {
      noExternal: ['mermaid'],
    },
  },

  themeConfig: {
    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: 'Sections',
    },

    nav: [
      { text: 'Brief', link: '/brief/' },
      { text: 'Hackathon', link: '/hackathon/' },
      { text: 'UX', link: '/ux/' },
      { text: 'Whitepaper', link: '/whitepaper/' },
      { text: 'Map', link: '/map/' },
      { text: 'Stack', link: '/stack/' },
      { text: 'Planning', link: '/planning/' },
      { text: 'Notes', link: '/notes/' },
    ],

    sidebar: {
      '/map/': [
        {
          text: 'System Map',
          items: [
            { text: 'What We\'re Building', link: '/map/' },
          ],
        },
      ],
      '/whitepaper/': [
        {
          text: 'Whitepaper',
          items: [
            { text: 'v0.0.20 (current)', link: '/whitepaper/' },
          ],
        },
        {
          text: 'Version Archive',
          collapsed: false,
          items: [
            { text: 'v0.0.19', link: '/versions/whitepaper/v0-0-19' },
            { text: 'v0.0.18', link: '/versions/whitepaper/v0-0-18' },
            { text: 'v0.0.17', link: '/versions/whitepaper/v0-0-17' },
            { text: 'v0.0.16', link: '/versions/whitepaper/v0-0-16' },
            { text: 'v0.0.15', link: '/versions/whitepaper/v0-0-15' },
            { text: 'v0.0.14', link: '/versions/whitepaper/v0-0-14' },
            { text: 'v0.0.13', link: '/versions/whitepaper/v0-0-13' },
            { text: 'v0.0.12', link: '/versions/whitepaper/v0-0-12' },
            { text: 'v0.0.11', link: '/versions/whitepaper/v0-0-11' },
            { text: 'v0.0.10', link: '/versions/whitepaper/v0-0-10' },
            { text: 'v0.0.9', link: '/versions/whitepaper/v0-0-9' },
            { text: 'v0.0.8', link: '/versions/whitepaper/v0-0-8' },
            { text: 'v0.0.7', link: '/versions/whitepaper/v0-0-7' },
            { text: 'v0.0.6', link: '/versions/whitepaper/v0-0-6' },
            { text: 'v0.0.5', link: '/versions/whitepaper/v0-0-5' },
            { text: 'v0.0.4', link: '/versions/whitepaper/v0-0-4' },
            { text: 'v0.0.3', link: '/versions/whitepaper/v0-0-3' },
          ],
        },
      ],
      '/brief/': [
        {
          text: 'Brief',
          items: [
            { text: 'v0.4.0 — The Idea Launchpad', link: '/brief/' },
          ],
        },
        {
          text: 'Archive',
          collapsed: true,
          items: [
            { text: 'v0.3.3a-X (AMM Marketplace)', link: '/versions/brief/v0-3-3a' },
            { text: 'v0.3.2-V (Context-First)', link: '/versions/brief/v0-3-2' },
            { text: 'v0.3.3x', link: '/versions/brief/v0-3-3x' },
            { text: 'v0.3.2x', link: '/versions/brief/v0-3-2x' },
            { text: 'v0.3.1x', link: '/versions/brief/v0-3-1x' },
            { text: 'v0.3.1d', link: '/versions/brief/v0-3-1d' },
            { text: 'v0.3.1c', link: '/versions/brief/v0-3-1c' },
            { text: 'v0.3.1b', link: '/versions/brief/v0-3-1b' },
            { text: 'v0.3.1a', link: '/versions/brief/v0-3-1a' },
            { text: 'v0.3.0', link: '/versions/brief/v0-3-0' },
            { text: 'v0.2.0', link: '/versions/brief/v0-2-0' },
            { text: 'v0.1.0', link: '/versions/brief/v0-1-0' },
            { text: 'v0.0.3', link: '/versions/brief/v0-0-3' },
          ],
        },
      ],
      '/hackathon/': [
        {
          text: 'Hackathon',
          items: [
            { text: 'Overview', link: '/hackathon/' },
            { text: 'MVP Build Brief', link: '/hackathon/mvp-build-brief' },
            { text: 'User Personas', link: '/hackathon/personas' },
            { text: 'Epics & User Stories', link: '/hackathon/user-stories' },
            { text: 'Work Actions', link: '/hackathon/work-actions' },
            { text: 'Integrations', link: '/hackathon/integrations' },
            { text: 'MVP Brief Changelog', link: '/hackathon/mvp-build-brief-changelog' },
            { text: 'Archive', link: '/hackathon/versions/' },
          ],
        },
      ],
      '/ux/': [
        {
          text: 'UX Briefs',
          items: [
            { text: 'Overview', link: '/ux/' },
            { text: 'V0 Prompt Pack', link: '/ux/v0-prompt-pack' },
            { text: 'Prompt Pack Version History', link: '/ux/v0-prompt-pack-changelog' },
            { text: 'Archive', link: '/ux/versions/' },
          ],
        },
      ],
      '/stack/': [
        {
          text: 'The Capacitor Stack',
          items: [
            { text: 'Overview', link: '/stack/' },
            { text: 'Emitter', link: '/stack/emitter' },
            { text: 'Capacitor', link: '/stack/capacitor' },
            { text: 'Facilitator', link: '/stack/facilitator' },
            { text: 'Executor', link: '/stack/executor' },
          ],
        },
      ],
      '/planning/': [
        {
          text: 'Planning',
          items: [
            { text: 'Overview', link: '/planning/' },
          ],
        },
        {
          text: 'ADRs',
          items: [
            { text: 'Overview', link: '/planning/adr/' },
            { text: 'v1 2026-03-01 Adversarial Analysis', link: '/planning/adr/v1-2026-03-01-1-adversarial-analysis-adr' },
            { text: 'v1 2026-03-01 Cross-System Integration', link: '/planning/adr/v1-2026-03-01-3-cross-system-integration-adr' },
            { text: 'v1 2026-03-02 Persistence and Auth (Vercel-First)', link: '/planning/adr/v1-2026-03-02-1-persistence-and-auth-minimal-vercel-adr' },
          ],
        },
        {
          text: 'Implementation Plans',
          items: [
            { text: 'Overview', link: '/planning/impl/' },
            { text: 'v1 2026-03-01 Adversarial Analysis', link: '/planning/impl/v1-2026-03-01-2-adversarial-analysis-impl' },
            { text: 'v1 2026-03-01 Cross-System Integration', link: '/planning/impl/v1-2026-03-01-4-cross-system-integration-impl' },
            { text: 'v1 2026-03-03 Persistence, Auth, and API Layer', link: '/planning/impl/v1-2026-03-03-1-persistence-auth-api-impl' },
            { text: 'v1 2026-03-03 OAuth Login and Access Control', link: '/planning/impl/v1-2026-03-03-2-oauth-login-access-control-impl' },
          ],
        },
        {
          text: 'Archive',
          collapsed: true,
          items: [
            { text: 'Overview', link: '/planning/archive/' },
          ],
        },
      ],
      '/notes/': [
        {
          text: 'Notes',
          items: [
            { text: 'Overview', link: '/notes/' },
            { text: 'System Diagrams', link: '/notes/system-diagrams' },
            { text: 'Adversarial Analysis', link: '/notes/adversarial-analysis' },
          ],
        },
        {
          text: 'Changelogs',
          items: [
            { text: 'Whitepaper Changelog', link: '/versions/whitepaper-changelog' },
            { text: 'Brief Changelog', link: '/versions/brief-changelog' },
            { text: 'Brief Versioning Model', link: '/versions/brief-versioning' },
          ],
        },
        {
          text: 'Version History',
          collapsed: true,
          items: [
            { text: 'All Versions', link: '/versions/' },
          ],
        },
      ],
      '/versions/': [
        {
          text: 'Notes',
          items: [
            { text: 'Overview', link: '/notes/' },
          ],
        },
        {
          text: 'Changelogs',
          items: [
            { text: 'Whitepaper Changelog', link: '/versions/whitepaper-changelog' },
            { text: 'Brief Changelog', link: '/versions/brief-changelog' },
            { text: 'Brief Versioning Model', link: '/versions/brief-versioning' },
          ],
        },
        {
          text: 'Whitepaper Versions',
          collapsed: false,
          items: [
            { text: 'v0.0.20 (current)', link: '/versions/whitepaper/v0-0-20' },
            { text: 'v0.0.19', link: '/versions/whitepaper/v0-0-19' },
            { text: 'v0.0.18', link: '/versions/whitepaper/v0-0-18' },
            { text: 'v0.0.17', link: '/versions/whitepaper/v0-0-17' },
            { text: 'v0.0.16', link: '/versions/whitepaper/v0-0-16' },
            { text: 'v0.0.15', link: '/versions/whitepaper/v0-0-15' },
            { text: 'v0.0.14', link: '/versions/whitepaper/v0-0-14' },
            { text: 'v0.0.13', link: '/versions/whitepaper/v0-0-13' },
            { text: 'v0.0.12', link: '/versions/whitepaper/v0-0-12' },
            { text: 'v0.0.11', link: '/versions/whitepaper/v0-0-11' },
            { text: 'v0.0.10', link: '/versions/whitepaper/v0-0-10' },
            { text: 'v0.0.9', link: '/versions/whitepaper/v0-0-9' },
            { text: 'v0.0.8', link: '/versions/whitepaper/v0-0-8' },
            { text: 'v0.0.7', link: '/versions/whitepaper/v0-0-7' },
            { text: 'v0.0.6', link: '/versions/whitepaper/v0-0-6' },
            { text: 'v0.0.5', link: '/versions/whitepaper/v0-0-5' },
            { text: 'v0.0.4', link: '/versions/whitepaper/v0-0-4' },
            { text: 'v0.0.3', link: '/versions/whitepaper/v0-0-3' },
          ],
        },
        {
          text: 'Brief Versions',
          collapsed: true,
          items: [
            { text: 'v0.3.3a-X (current default)', link: '/brief/' },
            { text: 'v0.3.2-V (alternate canonical)', link: '/versions/brief/v0-3-2' },
            { text: 'v0.3.3-X (archived prior default)', link: '/versions/brief/v0-3-3x' },
            { text: 'v0.3.2-X (archived prior default)', link: '/versions/brief/v0-3-2x' },
            { text: 'v0.3.1-X (archived prior default)', link: '/versions/brief/v0-3-1x' },
            { text: 'v0.3.1d (archived)', link: '/versions/brief/v0-3-1d' },
            { text: 'v0.3.1c', link: '/versions/brief/v0-3-1c' },
            { text: 'v0.3.1b', link: '/versions/brief/v0-3-1b' },
            { text: 'v0.3.1a', link: '/versions/brief/v0-3-1a' },
            { text: 'v0.3.0', link: '/versions/brief/v0-3-0' },
            { text: 'v0.2.0', link: '/versions/brief/v0-2-0' },
            { text: 'v0.1.0', link: '/versions/brief/v0-1-0' },
            { text: 'v0.0.3', link: '/versions/brief/v0-0-3' },
          ],
        },
        {
          text: 'UX Versions',
          collapsed: true,
          items: [
            { text: 'v0.4 Prompt Pack (current)', link: '/ux/v0-prompt-pack' },
            { text: 'v0.3 Prompt Pack (archived)', link: '/ux/versions/v0-prompt-pack-v0-3' },
            { text: 'v0.2 Prompt Pack (archived)', link: '/ux/versions/v0-prompt-pack-v0-2' },
            { text: 'v0.1 Prompt Pack (archived)', link: '/ux/versions/v0-prompt-pack-v0-1' },
            { text: 'UX Archive', link: '/ux/versions/' },
          ],
        },
      ],
    },

    footer: {
      message: 'Capacitor Documentation',
      copyright: 'Copyright © 2026 Capacitor',
    },
  },

  srcExclude: [
    '**/dist/**',
    // Section files are included into whitepaper/index.md — don't generate standalone pages
    'whitepaper/agentic-economy.md',
    'whitepaper/executive-summary.md',
    'whitepaper/part-*.md',
    'whitepaper/conclusion.md',
    'whitepaper/glossary.md',
    'whitepaper/appendix-b-investor-questions.md',
  ],
})
