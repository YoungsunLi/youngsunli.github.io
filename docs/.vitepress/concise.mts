import { defineConcise } from 'vitepress-theme-concise/node'

export default defineConcise({
  posts: new URL('../posts/', import.meta.url),
  perPage: 10,
  hostname: 'https://lsun.net',
  giscus: {
    repo: 'YoungsunLi/youngsunli.github.io',
    repoId: 'MDEwOlJlcG9zaXRvcnkxNjcyODY4NjA=',
    category: 'Announcements',
    categoryId: 'DIC_kwDOCfiYTM4DE1n5'
  }
})
