import { useState, useEffect, useCallback } from "react";
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

// CategoryColor enum에 맞는 색상 객체
export const categoryColorMap = {
    RED: { colorName: "RED", hex: "#FF9494", displayName: "빨간색" },
    ORANGE: { colorName: "ORANGE", hex: "#FFBD9B", displayName: "주황색" },
    YELLOW: { colorName: "YELLOW", hex: "#FFD89C", displayName: "노란색" },
    GREEN: { colorName: "GREEN", hex: "#9DC08B", displayName: "초록색" },
    BLUE: { colorName: "BLUE", hex: "#7FBCD2", displayName: "파란색" },
    INDIGO: { colorName: "INDIGO", hex: "#A0C4FF", displayName: "남색" },
    VIOLET: { colorName: "VIOLET", hex: "#E5BEEC", displayName: "보라색" }
};

// 색상 배열
export const categoryColors = Object.values(categoryColorMap);

// 스케줄 관련 로직을 담당하는 커스텀 훅
export function useSchedule() {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const selectedDateStr = formatDate(selectedDate);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // 새로고침 트리거
    
    // 카테고리 관련 상태
    const [categories, setCategories] = useState([]);
    const [usedColors, setUsedColors] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [categoryError, setCategoryError] = useState(null);
    const [categoryRefreshTrigger, setCategoryRefreshTrigger] = useState(0); // 카테고리 새로고침 트리거

    // 일정 수정 함수
    const updateSchedule = async (scheduleId, scheduleData) => {
        try {
            const response = await api.patch(`/api/v1/schedules?scheduleId=${scheduleId}`, scheduleData);
            if (response.status === 200) {
                fetchSchedules(); // 일정 목록 새로고침
                return true;
            }
            return false;
        } catch (error) {
            console.error('일정 수정 실패:', error);
            return false;
        }
    };

    // 일정 삭제 함수
    const deleteSchedule = async (scheduleId) => {
        try {
            const response = await api.delete(`/api/v1/schedules?scheduleId=${scheduleId}`);
            if (response.status === 200) {
                fetchSchedules(); // 일정 목록 새로고침
                return true;
            }
            return false;
        } catch (error) {
            console.error('일정 삭제 실패:', error);
            return false;
        }
    };

    // 일정 상세 조회 함수
    const getScheduleDetail = async (scheduleId) => {
        try {
            const response = await api.get(`/api/v1/schedules/detail?scheduleId=${scheduleId}`);
            if (response.status === 200) {
                return response.data.data;
            }
            return null;
        } catch (error) {
            console.error('일정 상세 조회 실패:', error);
            return null;
        }
    };

    // API에서 일정 데이터 가져오기
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

    // 일정 추가 함수
    const addSchedule = async (scheduleData) => {
        try {
            const response = await api.post('/api/v1/schedules', scheduleData);
            if (response.status === 200) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('일정 추가 실패:', error);
            return false;
        }
    };

    // 카테고리 목록 및 사용 중인 색상 가져오기
    const fetchCategories = useCallback(async () => {
        setCategoryLoading(true);
        try {
            // API 요청으로 카테고리 목록 가져오기
            const response = await api.get('/api/v1/categories');
            if (response.status === 200) {
                const categoryData = response.data.data || [];
                setCategories(categoryData);
                
                // 사용 중인 색상 목록 업데이트
                const colors = categoryData.map(cat => cat.color);
                setUsedColors(colors);
                setCategoryError(null);
                return categoryData;
            }
            return [];
        } catch (error) {
            console.error('카테고리 조회 실패:', error);
            setCategoryError('카테고리를 불러오는데 실패했습니다.');
            // 빈 배열로 초기화
            setCategories([]);
            setUsedColors([]);
            return [];
        } finally {
            setCategoryLoading(false);
        }
    }, []);

    // 카테고리 ID로 카테고리 조회
    const getCategoryById = useCallback((categoryId) => {
        // 타입 안전 비교를 위해 문자열로 변환하여 비교
        const categoryIdStr = String(categoryId);
        const foundCategory = categories.find(cat => String(cat.id) === categoryIdStr) || null;
        return foundCategory;
    }, [categories]);

    // 카테고리 색상으로 카테고리 조회
    const findCategoryByColor = useCallback((colorName) => {
        if (!colorName) return null;
        
        // 대소문자 통일을 위해 모두 대문자로 변환
        const normalizedColorName = colorName.toUpperCase();
        
        return categories.find(cat => 
            cat.color && cat.color.toUpperCase() === normalizedColorName
        );
    }, [categories]);

    // 색상이 사용 가능한지 확인하는 함수
    const isColorAvailable = useCallback((colorName) => {
        if (!colorName) return false;
        
        // 대소문자 통일을 위해 모두 대문자로 변환
        const normalizedColorName = colorName.toUpperCase();
        const normalizedUsedColors = usedColors.map(color => color.toUpperCase());
        
        return !normalizedUsedColors.includes(normalizedColorName);
    }, [usedColors]);

    // 사용 가능한 첫 번째 색상 찾기
    const findFirstAvailableColor = useCallback(() => {
        for (const color of Object.keys(categoryColorMap)) {
            if (isColorAvailable(color)) {
                return color;
            }
        }
        return null; // 모든 색상이 사용 중인 경우
    }, [isColorAvailable]);

    // 카테고리 색상 Hex 코드 가져오기
    const getCategoryColorHex = useCallback((colorName) => {
        return categoryColorMap[colorName]?.hex || "#A3B29F";
    }, []);

    // 카테고리 추가 또는 수정 함수
    const addOrUpdateCategory = useCallback(async (categoryData) => {
        try {
            if (!categoryData.name.trim() || !categoryData.color) {
                return { success: false, message: '카테고리 이름과 색상은 필수입니다.' };
            }

            // 색상으로 기존 카테고리 찾기
            const existingCategory = findCategoryByColor(categoryData.color);
            
            let response;
            const requestDto = {
                name: categoryData.name.trim(),
                color: categoryData.color,
                categoryType: "SCHEDULE"
            };
            
            // 기존 카테고리가 있으면 수정, 없으면 추가
            if (existingCategory) {
                const patchDto = {
                    categoryId: existingCategory.id,
                    ...requestDto
                };
                
                response = await api.patch('/api/v1/categories', patchDto);
            } else {
                response = await api.post('/api/v1/categories', requestDto);
            }
            
            if (response.status === 200 && response.data.data) {
                // 카테고리 새로고침 트리거 증가
                setCategoryRefreshTrigger(prev => prev + 1);
                return { 
                    success: true, 
                    data: response.data.data,
                    isNew: !existingCategory 
                };
            }
            
            return { success: false, message: '카테고리 저장에 실패했습니다.' };
        } catch (error) {
            console.error('카테고리 저장 실패:', error);
            return { success: false, message: '카테고리 저장에 실패했습니다.' };
        }
    }, [findCategoryByColor]);

    // 카테고리 삭제 함수
    const deleteCategory = useCallback(async (categoryId) => {
        try {
            if (!categoryId) {
                return { success: false, message: '카테고리 ID가 필요합니다.' };
            }
            
            const response = await api.delete(`/api/v1/categories?categoryId=${categoryId}`);
            
            if (response.status === 200) {
                // 카테고리 새로고침 트리거 증가
                setCategoryRefreshTrigger(prev => prev + 1);
                return { success: true };
            }
            
            return { success: false, message: '카테고리 삭제에 실패했습니다.' };
        } catch (error) {
            console.error('카테고리 삭제 실패:', error);
            return { success: false, message: '카테고리 삭제에 실패했습니다.' };
        }
    }, []);

    // 카테고리 데이터 새로고침 함수
    const refreshCategories = useCallback(() => {
        setCategoryRefreshTrigger(prev => prev + 1);
    }, []);

    // 컴포넌트 마운트 시 작업
    useEffect(() => {
        fetchSchedules();
    }, [refreshTrigger]); // 새로고침 트리거가 변경될 때 마다 일정 데이터 가져오기

    // 카테고리 데이터 로드
    useEffect(() => {
        fetchCategories();
    }, [categoryRefreshTrigger, fetchCategories]); // 카테고리 새로고침 트리거가 변경될 때 마다 카테고리 데이터 가져오기

    useEffect(() => {
        // 일정 추가/수정/삭제 이벤트 리스너
        const handleScheduleChanged = () => {
            setRefreshTrigger(prev => prev + 1);
        };

        window.addEventListener('scheduleAdded', handleScheduleChanged);
        window.addEventListener('scheduleUpdated', handleScheduleChanged);
        window.addEventListener('scheduleDeleted', handleScheduleChanged);

        // 컴포넌트 언마운트 시 이벤트 리스너 제거
        return () => {
            window.removeEventListener('scheduleAdded', handleScheduleChanged);
            window.removeEventListener('scheduleUpdated', handleScheduleChanged);
            window.removeEventListener('scheduleDeleted', handleScheduleChanged);
        };
    }, []);

    // 선택한 날짜가 일정 기간에 포함되는지 확인하는 함수
    const isDateInScheduleRange = (date, schedule) => {
        if (!schedule.endTime) {
            return formatDate(new Date(schedule.startTime)) === formatDate(date);
        }

        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        const startDate = new Date(schedule.startTime);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(schedule.endTime);
        endDate.setHours(0, 0, 0, 0);

        return checkDate >= startDate && checkDate <= endDate;
    };

    // 선택된 날짜의 일정 (여러 날짜에 걸친 일정 포함)
    const todaySchedule = schedules.find(schedule => 
        isDateInScheduleRange(selectedDate, schedule)
    );

    // 선택된 날짜의 일정 목록 (여러 날짜에 걸친 일정 포함)
    const scheduleList = schedules.filter(schedule => 
        isDateInScheduleRange(selectedDate, schedule)
    );

    // 날짜에 일정이 있는지 확인하는 함수
    const hasScheduleOnDate = (date) => {
        const dateStr = formatDate(date);
        const result = {
            hasSingleDay: false,
            multiDaySchedules: []
        };

        for (const schedule of schedules) {
            if (isDateInScheduleRange(date, schedule)) {
                // 하루짜리 일정인지 또는 여러 날에 걸친 일정인지 확인
                if (!schedule.endTime || formatDate(new Date(schedule.startTime)) === formatDate(new Date(schedule.endTime))) {
                    result.hasSingleDay = true;
                } else {
                    result.multiDaySchedules.push(schedule.id);
                }
            }
        }

        return result;
    };

    return {
        // 일정 관련 상태 및 함수
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
        fetchSchedules,
        addSchedule,
        getScheduleDetail,
        updateSchedule,
        deleteSchedule,
        
        // 카테고리 관련 상태 및 함수
        categories,
        categoryLoading,
        categoryError,
        fetchCategories,
        usedColors,
        getCategoryById,
        findCategoryByColor,
        isColorAvailable,
        findFirstAvailableColor,
        getCategoryColorHex,
        addOrUpdateCategory,
        deleteCategory,
        
        // 카테고리 상수
        categoryColors,
        categoryColorMap,
        
        // 카테고리 데이터 새로고침 함수
        refreshCategories,
    };
}
