module.exports = {
    base: '/',
    title: 'Young sun',
    description: "Youngsun's Blog",
    head: [
        ['link', {rel: 'icon', href: '/favicon.ico'}]
    ],
    dest: './dist',
    markdown: {
        lineNumbers: true
    },
    evergreen: true,
    locales: {
        '/': {
            lang: 'zh-CN'
        }
    },
    theme: '',
    themeConfig: {}
};
