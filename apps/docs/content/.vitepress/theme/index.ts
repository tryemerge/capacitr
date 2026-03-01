import DefaultTheme from 'vitepress/theme'
import GiscusLayout from './GiscusLayout.vue'
import ExportButtons from './ExportButtons.vue'
import FullscreenDiagram from './FullscreenDiagram.vue'
import './print.css'

export default {
  extends: DefaultTheme,
  Layout: GiscusLayout,
  enhanceApp({ app }) {
    app.component('ExportButtons', ExportButtons)
    app.component('FullscreenDiagram', FullscreenDiagram)
  },
}
