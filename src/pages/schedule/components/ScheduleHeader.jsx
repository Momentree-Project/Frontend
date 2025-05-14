import { useSchedule } from "../hooks/useSchedule";
import { useMemo } from "react";

export function ScheduleHeader({ selectedDateStr, scheduleList, onScheduleClick }) {
    const { getCategoryById, getCategoryColorHex, anniversaries, categoryColorMap } = useSchedule();
    
    // 순차적 색상 선택 함수
    const getHeartColor = (index) => {
        const colors = Object.values(categoryColorMap).map(color => color.hex);
        return colors[index % colors.length];
    };

    // 날짜 포맷팅 함수 추가
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    };

    // 시간 포맷팅 함수
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();

        // 시간만 표시하거나 분이 있는 경우 시:분 형식으로 표시
        return minutes === 0 ? `${hours}시` : `${hours}:${minutes.toString().padStart(2, '0')}`;
    };

    // 일정 시간 범위 표시 함수 - 통일된 형식으로 변경
    const formatTimeRange = (schedule) => {
        if (schedule.isAllDay) {
            return <span className="text-[12px] text-point bg-[#F5F8F3] px-2 py-0.5 rounded-full inline-block">종일</span>;
        }

        // 시작 날짜와 시간
        const startDateStr = formatDate(schedule.startTime);
        const startTimeStr = formatTime(schedule.startTime);
        
        // 종료 날짜와 시간
        const endDateStr = formatDate(schedule.endTime);
        const endTimeStr = formatTime(schedule.endTime);
        
        // 날짜와 시간을 통일된 형식으로 반환
        return (
            <span className="text-[12px] text-subpoint flex items-center">
                <span className="text-[11px] mr-1">🕒</span>
                {startDateStr} {startTimeStr} ~ {endDateStr} {endTimeStr}
            </span>
        );
    };

    // 일정 유형에 따른 색상 지정 - 더 부드러운 파스텔 톤으로 변경
    const getScheduleColor = (schedule) => {
        // 카테고리가 있으면 해당 카테고리 색상 사용
        if (schedule.categoryId) {
            const category = getCategoryById(schedule.categoryId);
            if (category) {
                return getCategoryColorHex(category.color);
            }
        }
        
        // 카테고리가 없으면 기본 색상 사용
        const defaultColors = [
            '#9DC08B', // 부드러운 녹색
            '#B1C9E8', // 연한 파랑
            '#F8C4B4', // 연한 코랄
            '#E5BEEC', // 연한 라벤더
            '#FFD89C'  // 연한 노랑
        ];
        return defaultColors[schedule.id % defaultColors.length];
    };

    // 카테고리 정보 표시 함수
    const renderCategoryBadge = (schedule) => {
        if (!schedule.categoryId) return null;
        
        const category = getCategoryById(schedule.categoryId);
        if (!category) return null;
        
        const hexColor = getCategoryColorHex(category.color);
        // 배경색은 원래 색상에 투명도 35%로 설정하여 적당히 강조
        const bgColor = hexColor + "35";
        
        return (
            <span 
                className="text-[11px] font-medium px-2 py-[2px] rounded-full inline-flex items-center"
                style={{ 
                    backgroundColor: bgColor,
                    color: hexColor,
                    boxShadow: `0 0 0 1px ${hexColor}60`
                }}
            >
                <span 
                    className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0" 
                    style={{ backgroundColor: hexColor }}
                ></span>
                <span className="truncate max-w-[60px]">{category.name}</span>
            </span>
        );
    };

    return (
        <section className="bg-cardbg rounded-[22px] shadow-[0_2px_12px_#e2e5db] px-[20px] py-[24px] flex flex-col gap-[16px] mb-0">
            {/* 날짜 */}
            <div className="text-[16px] text-subpoint mb-[4px]">{selectedDateStr.replace(/-/g, ".")}</div>
            {/* 인사말 */}
            <div className="text-[20px] font-bold text-textmain mb-[8px]">안녕, 오늘의 데이트는?</div>
            {/* D-day 박스 */}
            <div className="bg-gradient-to-br from-[#E6EDE4] to-[#F0F5ED] rounded-[16px] px-[18px] py-[16px] text-[15px] text-point flex flex-col gap-[14px] shadow-[0_2px_8px_rgba(93,106,90,0.08)]">
                <div className="flex items-center gap-2.5 mb-0.5">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-point"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <span className="font-semibold">기념일 디데이</span>
                </div>
                {anniversaries.map((anniversary, index) => (
                    <div key={anniversary.days} className="flex items-center justify-between bg-[#F5F8F3] rounded-xl px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className={`h-5 w-5 ${anniversary.isSpecial ? '' : 'text-point'}`}
                                fill={anniversary.isSpecial ? getHeartColor(index) : 'none'}
                                viewBox="0 0 24 24"
                                stroke={anniversary.isSpecial ? getHeartColor(index) : 'currentColor'}
                            >
                                {anniversary.isSpecial ? (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                ) : (
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                )}
                            </svg>
                            <span className="font-medium text-[15px]">{anniversary.title}</span>
                        </div>
                        <span className="bg-point/10 text-point px-2.5 py-1 rounded-full text-[13px] font-medium">
                            D-{anniversary.dday}
                        </span>
                    </div>
                ))}
            </div>
            {/* 오늘 일정 리스트 */}
            <div className="bg-white rounded-[12px] overflow-hidden">
                <div className="text-[16px] text-point font-medium px-[16px] py-[12px] border-b border-gray-100">
                    오늘의 일정
                </div>
                {scheduleList && scheduleList.length > 0 ? (
                    <div>
                        {scheduleList.map((schedule, index) => (
                            <div
                                key={schedule.id}
                                className="px-[16px] py-[12px] hover:bg-gray-50 transition-colors border-l-[4px] cursor-pointer flex flex-col"
                                style={{ 
                                    borderLeftColor: getScheduleColor(schedule),
                                    backgroundColor: `${getScheduleColor(schedule)}08` // 매우 연한 배경색 추가
                                }}
                                onClick={() => onScheduleClick && onScheduleClick(schedule.id)}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center">
                                        <span className="text-[15px] font-medium text-textmain">{schedule.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {/* 카테고리 정보 */}
                                        {renderCategoryBadge(schedule)}
                                        
                                        {/* 날씨 아이콘 */}
                                        {schedule.weather && (
                                            <span className="text-[16px]">
                                                {schedule.weather === "맑음" ? "☀️" :
                                                    schedule.weather === "흐림" ? "🌤️" :
                                                        schedule.weather === "비" ? "🌧️" : ""}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {/* 시간 표시 - 새로운 포맷팅 함수 사용 */}
                                    {formatTimeRange(schedule)}

                                    {/* 위치 정보 */}
                                    {schedule.location && (
                                        <span className="text-[12px] text-subpoint flex items-center">
                                            <span className="text-[11px] mr-1">📍</span>
                                            {schedule.location}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center py-[20px] text-[15px] text-subpoint">
                        일정이 없습니다
                    </div>
                )}
            </div>
        </section>
    );
}
