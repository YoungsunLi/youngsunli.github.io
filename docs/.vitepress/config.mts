import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'YoungsunLi',
  description: "Youngsun's Blog · DEV DESIGN DIY",
  base: '/',
  outDir: '../dist',
  cleanUrls: false,
  lastUpdated: false,

  // 文章 URL 形如 /posts/<slug>/
  rewrites: {
    'posts/:slug.md': 'posts/:slug/index.md'
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'author', content: 'Youngsun Li' }],
    ['meta', { property: 'og:site_name', content: "Youngsun's Blog" }],
    // 立创开源没有内置图标，按 VitePress 社交图标的约定用 CSS mask 上色，见下方 socialLinks
    ['style', {}, '.vpi-social-oshwhub { --icon: url(/oshwhub-logo.png) }']
  ],

  vite: {
    ssr: { noExternal: ['vitepress-theme-concise'] },
    // 主题以源码形式引用，与博客各有一份依赖，需统一到同一实例
    resolve: { dedupe: ['vue', 'vitepress'] },
    server: {
      // dev 与 build 并行时会争用 .temp，Windows 下触发 EBUSY
      watch: {
        ignored: ['**/.vitepress/.temp/**', '**/.vitepress/cache/**', '**/dist/**']
      }
    }
  },

  // 主题使用系统字体栈，无需预加载 Inter
  transformHtml(code) {
    return code.replace(/<link rel="preload"[^>]*inter-roman[^>]*>/g, '')
  },

  markdown: {
    lineNumbers: true,
    // 代码块在明暗模式下统一使用 One Dark
    theme: 'one-dark-pro'
  },

  themeConfig: {
    concise: {
      perPage: 10
    },

    nav: [
      { text: '首页', link: '/' },
      { text: '关于', link: '/about/' }
    ],

    sidebar: {
      '/posts/': [
        {
          text: '文章',
          items: [
            { text: 'ESP32-S3 GPIO 速查', link: '/posts/esp32-s3-gpio/' },
            { text: 'ESP32-C6 GPIO 速查', link: '/posts/esp32-c6-gpio/' },
            { text: 'ESP32-C3 GPIO 速查', link: '/posts/esp32-c3-gpio/' },
            { text: '迷你 USB HUB 切换器', link: '/posts/usb-hub-switcher/' },
            { text: '树莓派温控散热风扇', link: '/posts/raspberry-pi-auto-fan/' },
            { text: 'AMD Ryzen 启动 Android Studio Emulator 虚拟机', link: '/posts/amd-android-emulator/' },
            { text: 'Vue + Electron 混合开发并使用 Node.js 遇到的一个坑', link: '/posts/vue-electron-nodejs/' },
            { text: '新的开始, 从 Typecho 到 VuePress', link: '/posts/new-beginning/' }
          ]
        }
      ]
    },

    outline: { level: [2, 3], label: '本页目录' },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/YoungsunLi', ariaLabel: 'GitHub' },
      {
        // 不能用内联 SVG mask：桌面导航栏和移动端菜单各渲染一份，mask 的 id 重复，
        // 菜单里的引用会命中被隐藏的那份，图标变成实心方块。
        // 图标 PNG 已裁去透明边并补成正方形，随 currentColor 变色。
        icon: 'oshwhub',
        link: 'https://oshwhub.com/youngsunli',
        ariaLabel: '立创开源'
      }
    ],

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '无法找到相关结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },

    footer: {
      message:
        'Powered by <a href="https://vitepress.dev/">VitePress</a>. ' +
        'Theme by <a href="https://github.com/YoungsunLi/vitepress-theme-concise">concise</a>' +
        '<br><a href="https://beian.miit.gov.cn" target="_blank" rel="noopener">桂ICP备18004414号-1</a>',
      copyright: '© 2018-present <a href="https://lsun.net/">Youngsun Li</a>'
    },

    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式'
  }
})