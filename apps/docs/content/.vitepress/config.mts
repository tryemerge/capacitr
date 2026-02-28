import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'EmMittr',
  description: 'A growth engine for token economies. A bridge to a decentralized agentic future.',
  
  themeConfig: {
    nav: [
      { text: 'Brief', link: '/brief/' },
      { text: 'Whitepaper', link: '/whitepaper/' },
      { text: 'Changelog', link: '/changelog' },
    ],

    sidebar: {
      '/whitepaper/': [
        {
          text: 'Whitepaper',
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
            { text: 'Part VII: Competitive Landscape', link: '/whitepaper/part-7-competitive' },
            { text: 'Part VIII: Risks', link: '/whitepaper/part-8-risks' },
            { text: 'Part IX: Roadmap', link: '/whitepaper/part-9-roadmap' },
            { text: 'Conclusion', link: '/whitepaper/conclusion' },
            { text: 'Glossary', link: '/whitepaper/glossary' },
          ]
        }
      ],
      '/brief/': [
        {
          text: 'Brief',
          items: [
            { text: 'EmMittr Brief', link: '/brief/' },
          ]
        }
      ]
    },
  },

  srcExclude: ['**/dist/**'],
})
