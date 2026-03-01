<script setup>
import DefaultTheme from 'vitepress/theme'
import Giscus from '@giscus/vue'
import { useData, useRoute } from 'vitepress'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const route = useRoute()
</script>

<template>
  <Layout>
    <template #doc-after>
      <div v-if="frontmatter.comments !== false" class="giscus-container">
        <Giscus
          :key="route.path"
          repo="[OWNER]/[REPO]"
          repo-id="[REPO_ID]"
          category="Comments"
          category-id="[CATEGORY_ID]"
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
