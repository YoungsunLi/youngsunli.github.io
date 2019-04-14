module.exports = {
    base: '/',
    title: 'Young sun 🚀',
    description: "Youngsun's Blog",
    head: [
        ['link', {rel: 'icon', href: '/favicon.ico'}]
    ],
    dest: './dist',
    markdown: {
        lineNumbers: true
    },
    evergreen: false,
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    themeConfig: {
        nav: [
            {text: '首页', link: '/'},
            {text: '关于', link: '/about/'},
            {text: 'GitHub', link: 'https://github.com/YoungsunLi'},
            {text: 'Typecho站点', link: 'https://lsun.net'},
            {
                text: '友链',
                items: [
                    {text: '罗东荣的博客', link: 'http://sinlo.net'}
                ]
            }
        ],
        sidebar: 'auto',
        lastUpdated: '上次更新',
    }
};
