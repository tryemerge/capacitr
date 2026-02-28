import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Capacitr',
  description: 'Governance that pays for itself. Reasoning priced in real time.',

  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,

  head: [
    ['link', { rel: 'stylesheet', href: '/css/styles.css' }],
  ],

  themeConfig: {
    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Brief', link: '/brief/' },
      { text: 'Whitepaper', link: '/whitepaper/' },
      {
        text: 'Versions',
        items: [
          { text: 'Version History', link: '/versions/' },
          { text: 'Whitepaper Changelog', link: '/versions/whitepaper-changelog' },
          { text: 'Brief Changelog', link: '/versions/brief-changelog' },
          {
            text: 'Archived Versions',
            items: [
              { text: 'Whitepaper v0.0.16', link: '/versions/whitepaper/v0-0-16' },
              { text: 'Brief v0.0.3', link: '/versions/brief/v0-0-3' },
            ],
          },
        ],
      },
    ],

    sidebar: {
      '/whitepaper/': [
        {
          text: 'Whitepaper v0.0.20',
          items: [
            { text: 'Overview', link: '/whitepaper/' },
            { text: 'The Agentic Economy', link: '/whitepaper/agentic-economy' },
            { text: 'Executive Summary', link: '/whitepaper/executive-summary' },
            { text: 'Part I: The Opportunity', link: '/whitepaper/part-1-opportunity' },
            { text: 'Part II: The EmMittr Model', link: '/whitepaper/part-2-model' },
            { text: 'Part III: Work — Three Classes', link: '/whitepaper/part-3-work' },
            { text: 'Part IV: Implementation', link: '/whitepaper/part-4-implementation' },
            { text: 'Part V: Use Cases', link: '/whitepaper/part-5-use-cases' },
            { text: 'Part VI: Why Agents', link: '/whitepaper/part-6-agents' },
            { text: 'Part VII: Proof of Good Judgement', link: '/whitepaper/part-7-proof-of-good-judgement' },
            { text: 'Part VIII: Competitive Landscape', link: '/whitepaper/part-8-competitive' },
            { text: 'Part IX: Questions and Risks', link: '/whitepaper/part-9-questions-and-risks' },
            { text: 'Part X: Roadmap', link: '/whitepaper/part-10-roadmap' },
            { text: 'Conclusion', link: '/whitepaper/conclusion' },
            { text: 'Glossary', link: '/whitepaper/glossary' },
            { text: 'Appendix B: Investor Questions', link: '/whitepaper/appendix-b-investor-questions' },
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
      ],
      '/versions/': [
        {
          text: 'Version History',
          items: [
            { text: 'Overview', link: '/versions/' },
            { text: 'Whitepaper Changelog', link: '/versions/whitepaper-changelog' },
            { text: 'Brief Changelog', link: '/versions/brief-changelog' },
          ],
        },
        {
          text: 'Archived Versions',
          items: [
            { text: 'Whitepaper v0.0.16', link: '/versions/whitepaper/v0-0-16' },
            { text: 'Brief v0.0.3', link: '/versions/brief/v0-0-3' },
          ],
        },
      ],
    },

    footer: {
      message: 'Capacitr Documentation',
      copyright: 'Copyright © 2026 Capacitr',
    },
  },

  srcExclude: ['**/dist/**'],
})
