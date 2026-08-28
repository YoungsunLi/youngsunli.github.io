import { createPostsLoader } from 'vitepress-theme-concise/loader'

// glob 相对本文件所在目录
export default createPostsLoader('../../posts/*.md')
