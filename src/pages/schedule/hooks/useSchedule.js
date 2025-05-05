import { useState } from "react";
import axios from "axios";

// 날짜 포맷팅 유틸 함수
function formatDate(dateObj) {
    if (typeof dateObj === "string") return dateObj;

    // 로컬 시간대 기준으로 연, 월, 일 추출
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    // YYYY-MM-DD 형식으로 반환
    return `${year}-${month}-${day}`;
}


// 스케줄 관련 로직을 담당하는 커스텀 훅
export function useSchedule() {
    // 실제로는 API에서 데이터를 가져올 것입니다
    const mockSchedules = [
        { date: "2025-04-20", title: "하루종일 누워 있기", weather: "구름 조금" },
        { date: "2025-04-24", title: "파스타 만들기", weather: "맑음" },
        { date: "2025-05-04", title: "무슨무슨 기념일", weather: "맑음" },
    ];

    const [selectedDate, setSelectedDate] = useState(new Date("2025-04-24"));
    const selectedDateStr = formatDate(selectedDate);

    // 선택된 날짜의 일정
    const todaySchedule = mockSchedules.find((s) => s.date === selectedDateStr);

    // 선택된 날짜의 일정 목록
    const scheduleList = mockSchedules.filter((s) => s.date === selectedDateStr);

    // 날짜에 일정이 있는지 확인하는 함수
    const hasScheduleOnDate = (date) => {
        return mockSchedules.some((s) => s.date === formatDate(date));
    };

    return {
        selectedDate,
        setSelectedDate,
        selectedDateStr,
        todaySchedule,
        scheduleList,
        hasScheduleOnDate,
        formatDate,
    };
}
