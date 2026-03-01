import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid({
  title: 'Capacitr',
  description: 'Governance that pays for itself. Reasoning priced in real time.',

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
      { text: 'Whitepaper', link: '/whitepaper/' },
      { text: 'Notes', link: '/notes/' },
    ],

    sidebar: {
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
            { text: 'Capacitr Brief v0.1.0', link: '/brief/' },
          ],
        },
        {
          text: 'Version Archive',
          collapsed: true,
          items: [
            { text: 'v0.0.3', link: '/versions/brief/v0-0-3' },
          ],
        },
      ],
      '/notes/': [
        {
          text: 'Notes',
          items: [
            { text: 'Overview', link: '/notes/' },
            { text: 'System Diagrams', link: '/notes/system-diagrams' },
          ],
        },
        {
          text: 'Changelogs',
          items: [
            { text: 'Whitepaper Changelog', link: '/versions/whitepaper-changelog' },
            { text: 'Brief Changelog', link: '/versions/brief-changelog' },
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
            { text: 'v0.0.3', link: '/versions/brief/v0-0-3' },
          ],
        },
      ],
    },

    footer: {
      message: 'Capacitr Documentation',
      copyright: 'Copyright © 2026 Capacitr',
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
