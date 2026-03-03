<script setup>
import { ref } from 'vue'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableRow, TableCell, Table, WidthType, BorderStyle } from 'docx'

const props = defineProps({
  filename: { type: String, default: 'document' },
})

const exporting = ref(false)

function getContentEl() {
  return document.querySelector('.vp-doc div[class*="content"]') || document.querySelector('.vp-doc')
}

// -- PDF: print current page --

function exportPdf() {
  window.print()
}

// -- DOCX: parse rendered page into Word document --

function parseElement(el) {
  const paragraphs = []

  for (const node of el.children) {
    const tag = node.tagName?.toLowerCase()

    // Skip export buttons and VitePress chrome
    if (node.classList?.contains('export-buttons')) continue

    if (tag === 'h1') {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: node.textContent, bold: true, font: 'Arial', size: 36 })],
      }))
    } else if (tag === 'h2') {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text: node.textContent, bold: true, font: 'Arial', size: 30 })],
      }))
    } else if (tag === 'h3') {
      paragraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 160, after: 80 },
        children: [new TextRun({ text: node.textContent, bold: true, font: 'Arial', size: 26 })],
      }))
    } else if (tag === 'h4') {
      paragraphs.push(new Paragraph({
        spacing: { before: 120, after: 60 },
        children: [new TextRun({ text: node.textContent, bold: true, font: 'Arial', size: 24 })],
      }))
    } else if (tag === 'p') {
      paragraphs.push(new Paragraph({
        spacing: { after: 140, line: 264 },
        children: parseInlineNodes(node),
      }))
    } else if (tag === 'ul' || tag === 'ol') {
      paragraphs.push(...parseList(node, tag === 'ol', 0))
    } else if (tag === 'blockquote') {
      for (const child of node.children) {
        if (child.tagName?.toLowerCase() === 'p') {
          paragraphs.push(new Paragraph({
            spacing: { after: 140, line: 264 },
            indent: { left: 720 },
            children: [
              new TextRun({ text: child.textContent, font: 'Arial', size: 22, italics: true, color: '666666' }),
            ],
          }))
        }
      }
    } else if (tag === 'table') {
      const table = parseTable(node)
      if (table) paragraphs.push(table)
    } else if (tag === 'hr') {
      paragraphs.push(new Paragraph({
        spacing: { before: 120, after: 120 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
        children: [],
      }))
    } else if (tag === 'div') {
      paragraphs.push(...parseElement(node))
    }
  }

  return paragraphs
}

function parseInlineNodes(el) {
  const runs = []
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim()) {
        runs.push(new TextRun({ text: node.textContent, font: 'Arial', size: 22 }))
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.tagName.toLowerCase()
      if (tag === 'strong' || tag === 'b') {
        runs.push(new TextRun({ text: node.textContent, bold: true, font: 'Arial', size: 22 }))
      } else if (tag === 'em' || tag === 'i') {
        runs.push(new TextRun({ text: node.textContent, italics: true, font: 'Arial', size: 22 }))
      } else if (tag === 'code') {
        runs.push(new TextRun({ text: node.textContent, font: 'Courier New', size: 20 }))
      } else if (tag === 'a') {
        runs.push(new TextRun({ text: node.textContent, font: 'Arial', size: 22, color: '3451B2' }))
      } else {
        runs.push(new TextRun({ text: node.textContent, font: 'Arial', size: 22 }))
      }
    }
  }
  return runs.length ? runs : [new TextRun({ text: el.textContent, font: 'Arial', size: 22 })]
}

function parseList(listEl, ordered, level) {
  const items = []
  let index = 1
  for (const li of listEl.children) {
    if (li.tagName?.toLowerCase() !== 'li') continue

    let text = ''
    for (const child of li.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent
      } else if (child.nodeType === Node.ELEMENT_NODE && !['ul', 'ol'].includes(child.tagName.toLowerCase())) {
        text += child.textContent
      }
    }

    const prefix = ordered ? `${index}. ` : '\u2022 '
    items.push(new Paragraph({
      spacing: { after: 60, line: 264 },
      indent: { left: 360 + level * 360 },
      children: [new TextRun({ text: prefix + text.trim(), font: 'Arial', size: 22 })],
    }))
    index++

    for (const child of li.children) {
      const childTag = child.tagName?.toLowerCase()
      if (childTag === 'ul' || childTag === 'ol') {
        items.push(...parseList(child, childTag === 'ol', level + 1))
      }
    }
  }
  return items
}

function parseTable(tableEl) {
  const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
  const borders = { top: border, bottom: border, left: border, right: border }
  const rows = []

  // Determine column count from first row for even width distribution
  const firstRow = tableEl.querySelector('tr')
  const colCount = firstRow ? firstRow.querySelectorAll('th, td').length : 1
  const colWidthPct = Math.floor(100 / colCount)

  for (const tr of tableEl.querySelectorAll('tr')) {
    const cells = []
    for (const td of tr.querySelectorAll('th, td')) {
      const isHeader = td.tagName.toLowerCase() === 'th'
      cells.push(new TableCell({
        borders,
        width: { size: colWidthPct, type: WidthType.PERCENTAGE },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({
          spacing: { after: 0, line: 240 },
          children: [new TextRun({
            text: td.textContent.trim(),
            font: 'Arial',
            size: 18,
            bold: isHeader,
          })],
        })],
      }))
    }
    if (cells.length) rows.push(new TableRow({ children: cells }))
  }

  if (!rows.length) return null
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
}

async function exportDocx() {
  exporting.value = true
  try {
    const contentEl = getContentEl()
    if (!contentEl) return

    const children = parseElement(contentEl)

    const doc = new Document({
      styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
      },
      sections: [{
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1080, right: 1260, bottom: 1080, left: 1260 },
          },
        },
        children,
      }],
    })

    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${props.filename}.docx`
    a.click()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="export-buttons">
    <button class="export-btn" :disabled="exporting" @click="exportPdf">
      {{ exporting ? 'Exporting...' : 'Export PDF' }}
    </button>
    <button class="export-btn" :disabled="exporting" @click="exportDocx">
      {{ exporting ? 'Exporting...' : 'Export DOCX' }}
    </button>
  </div>
</template>

<style scoped>
.export-buttons {
  display: flex;
  gap: 0.75rem;
  margin: 1.25rem 0;
}

.export-btn {
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

.export-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: wait;
}
</style>
