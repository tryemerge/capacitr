<script setup>
import DefaultTheme from 'vitepress/theme'
import Giscus from '@giscus/vue'
import { useData, useRoute } from 'vitepress'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const route = useRoute()

const giscusRepo = import.meta.env.VITE_GISCUS_REPO || ''
const giscusRepoId = import.meta.env.VITE_GISCUS_REPO_ID || ''
const giscusCategory = import.meta.env.VITE_GISCUS_CATEGORY || 'Comments'
const giscusCategoryId = import.meta.env.VITE_GISCUS_CATEGORY_ID || ''

const commentsEnabled = Boolean(giscusRepo && giscusRepoId && giscusCategoryId)
</script>

<template>
  <Layout>
    <template #doc-after>
      <div v-if="frontmatter.comments !== false && commentsEnabled" class="giscus-container">
        <Giscus
          :key="route.path"
          :repo="giscusRepo"
          :repo-id="giscusRepoId"
          :category="giscusCategory"
          :category-id="giscusCategoryId"
          mapping="pathname"
          strict="1"
          reactions-enabled="1"
          emit-metadata="0"
          input-position="top"
          theme="preferred_color_scheme"
          lang="en"
          loading="lazy"
        />
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.giscus-container {
  margin-top: 2rem;
}
</style>
