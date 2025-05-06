import { useState, useEffect } from "react";
import api from '../../../api/axiosInstance';

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
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date("2025-04-24"));
    const selectedDateStr = formatDate(selectedDate);

    // API에서 일정 데이터 가져오기 - 훅 내부로 이동
    useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true);
            try {
                const response = await api.get('/api/v1/schedules');
                setSchedules(response.data.data || []);
                setError(null);
            } catch (error) {
                console.error('일정 조회 실패:', error);
                setError('일정을 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []); // 컴포넌트 마운트 시 한 번만 실행

    // 선택된 날짜의 일정
    const todaySchedule = schedules.find((s) => formatDate(new Date(s.startTime)) === selectedDateStr);

    // 선택된 날짜의 일정 목록
    const scheduleList = schedules.filter((s) => formatDate(new Date(s.startTime)) === selectedDateStr);

    // 날짜에 일정이 있는지 확인하는 함수
    const hasScheduleOnDate = (date) => {
        return schedules.some((s) => formatDate(new Date(s.startTime)) === formatDate(date));
    };

    return {
        schedules,
        loading,
        error,
        selectedDate,
        setSelectedDate,
        selectedDateStr,
        todaySchedule,
        scheduleList,
        hasScheduleOnDate,
        formatDate,
    };
}
