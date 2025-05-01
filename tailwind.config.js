module.exports = {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    safelist: [
        'bg-mainbg',
        'bg-cardbg',
        'text-textmain',
        'text-subpoint',
        'text-point',
        'text-sunshine',
    ],
    theme: {
        extend: {
            colors: {
                mainbg: '#ECEBE4',
                cardbg: '#F6F5F0',
                point: '#5D6A5A',
                subpoint: '#A3B29F',
                sunshine: '#F8D37D',
                textmain: '#3C3C3C',
                textsub: '#7C7C7C',
            },
            fontFamily: {
                noto: ["'Noto Sans KR'", "sans-serif"],
            },
        },
    },
    plugins: [],
}
