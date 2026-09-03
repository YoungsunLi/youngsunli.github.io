import { defineConcise } from 'vitepress-theme-concise/node'

export default defineConcise({
  posts: new URL('../posts/', import.meta.url),
  perPage: 10,
  hostname: 'https://lsun.net'
})
