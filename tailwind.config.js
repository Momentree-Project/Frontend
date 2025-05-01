/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                noto: ["'Noto Sans KR'", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'main-bg': '#ECEBE4',      // 전체 배경의 따뜻한 아이보리톤
                'main-point': '#5D6A5A',   // 버튼 등 핵심 액션 색상
                'sub-point': '#A3B29F',    // 캘린더/카드 강조 포인트
                'text-main': '#3C3C3C',    // 기본 텍스트 (딥 그레이)
                'text-sub': '#7C7C7C',     // 서브 텍스트
                'card-bg': '#F6F5F0',      // 카드/컴포넌트 배경
                'sun-icon': '#F8D37D',     // 날씨 아이콘 (햇빛 느낌)
            },
        },
    },
    plugins: [],
}
