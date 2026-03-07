<script setup>
import { ref } from 'vue'

const props = defineProps({
  filename: { type: String, default: 'pitch-deck' },
})

const exporting = ref(false)

function getSlides() {
  return document.querySelectorAll('.pitch-slide')
}

function parseSlideContent(slideEl) {
  const title = slideEl.querySelector('h2')?.textContent?.trim() || ''
  const blocks = []

  for (const node of slideEl.children) {
    const tag = node.tagName?.toLowerCase()
    if (tag === 'h2') continue // already captured as title

    if (tag === 'h3') {
      blocks.push({ type: 'subtitle', text: node.textContent.trim() })
    } else if (tag === 'p') {
      blocks.push({ type: 'text', text: node.textContent.trim() })
    } else if (tag === 'blockquote') {
      const text = node.textContent.trim()
      blocks.push({ type: 'quote', text })
    } else if (tag === 'ul' || tag === 'ol') {
      const items = []
      for (const li of node.querySelectorAll(':scope > li')) {
        items.push(li.textContent.trim())
      }
      blocks.push({ type: 'list', items })
    } else if (tag === 'table') {
      const rows = []
      for (const tr of node.querySelectorAll('tr')) {
        const cells = []
        for (const td of tr.querySelectorAll('th, td')) {
          cells.push(td.textContent.trim())
        }
        rows.push(cells)
      }
      blocks.push({ type: 'table', rows })
    } else if (tag === 'pre') {
      blocks.push({ type: 'code', text: node.textContent.trim() })
    }
  }

  return { title, blocks }
}

async function exportPptx() {
  exporting.value = true
  try {
    const PptxGenJS = (await import('pptxgenjs')).default
    const pptx = new PptxGenJS()

    pptx.layout = 'LAYOUT_WIDE'
    pptx.author = 'Capacitr'
    pptx.title = 'Capacitr Pitch Deck'

    const BRAND = 'F97316'
    const DARK = '1a1a2e'
    const LIGHT = 'f8f8f8'
    const MUTED = '888888'

    pptx.defineSlideMaster({
      title: 'CAPACITR',
      background: { color: DARK },
    })

    const slides = getSlides()
    if (!slides.length) return

    for (const slideEl of slides) {
      const { title, blocks } = parseSlideContent(slideEl)
      const slide = pptx.addSlide({ masterName: 'CAPACITR' })

      let yPos = 0.5

      // Title
      if (title) {
        slide.addText(title, {
          x: 0.8, y: yPos, w: 11.5, h: 0.8,
          fontSize: 28, bold: true, color: LIGHT,
          fontFace: 'Arial',
        })
        yPos += 1.0
      }

      for (const block of blocks) {
        if (yPos > 6.5) break // don't overflow

        if (block.type === 'quote') {
          slide.addText(block.text, {
            x: 0.8, y: yPos, w: 11.5, h: 0.6,
            fontSize: 16, italic: true, color: BRAND,
            fontFace: 'Arial',
          })
          yPos += 0.7
        } else if (block.type === 'subtitle') {
          slide.addText(block.text, {
            x: 0.8, y: yPos, w: 11.5, h: 0.5,
            fontSize: 20, bold: true, color: BRAND,
            fontFace: 'Arial',
          })
          yPos += 0.6
        } else if (block.type === 'text') {
          const lines = Math.ceil(block.text.length / 100)
          const h = Math.max(0.4, lines * 0.35)
          slide.addText(block.text, {
            x: 0.8, y: yPos, w: 11.5, h,
            fontSize: 14, color: LIGHT,
            fontFace: 'Arial',
            lineSpacingMultiple: 1.3,
          })
          yPos += h + 0.2
        } else if (block.type === 'list') {
          const listText = block.items.map(item => ({
            text: item,
            options: { bullet: { code: '2022' }, indentLevel: 0 },
          }))
          const h = Math.max(0.5, block.items.length * 0.4)
          slide.addText(listText, {
            x: 0.8, y: yPos, w: 11.5, h,
            fontSize: 14, color: LIGHT,
            fontFace: 'Arial',
            lineSpacingMultiple: 1.3,
          })
          yPos += h + 0.2
        } else if (block.type === 'table') {
          const tableRows = block.rows.map((row, ri) =>
            row.map(cell => ({
              text: cell,
              options: {
                fontSize: 12,
                color: ri === 0 ? DARK : LIGHT,
                bold: ri === 0,
                fill: { color: ri === 0 ? BRAND : '2a2a3e' },
                fontFace: 'Arial',
              },
            }))
          )
          slide.addTable(tableRows, {
            x: 0.8, y: yPos, w: 11.5,
            border: { type: 'solid', pt: 0.5, color: '444466' },
            colW: Array(block.rows[0]?.length || 1).fill(11.5 / (block.rows[0]?.length || 1)),
          })
          yPos += block.rows.length * 0.45 + 0.3
        } else if (block.type === 'code') {
          const lines = block.text.split('\n').length
          const h = Math.max(0.5, lines * 0.25)
          slide.addText(block.text, {
            x: 0.8, y: yPos, w: 11.5, h,
            fontSize: 11, color: MUTED,
            fontFace: 'Courier New',
            fill: { color: '111122' },
            lineSpacingMultiple: 1.2,
          })
          yPos += h + 0.2
        }
      }

      // Footer
      slide.addText('capacitr.xyz', {
        x: 0.8, y: 7.0, w: 3, h: 0.3,
        fontSize: 10, color: MUTED,
        fontFace: 'Arial',
      })
    }

    pptx.writeFile({ fileName: `${props.filename}.pptx` })
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <button class="export-btn pptx-btn" :disabled="exporting" @click="exportPptx">
    {{ exporting ? 'Exporting...' : 'Export PPTX' }}
  </button>
</template>

<style scoped>
.pptx-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s, background-color 0.2s;
}

.pptx-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
}

.pptx-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
