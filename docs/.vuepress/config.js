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
            {
                text: '认识的人',
                items: [
                    {text: '罗东荣的博客', link: 'http://sinlo.net'}
                ]
            },
            {
                text: '做过的事',
                items: [
                    {text: 'GitHub', link: 'https://github.com/YoungsunLi'},
                ]
            }
        ],
        sidebar: 'auto',
        lastUpdated: '最后一次更新于',
    }
};
