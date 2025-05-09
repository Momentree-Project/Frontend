import { useSchedule } from "../hooks/useSchedule";

export function ScheduleHeader({ selectedDateStr, scheduleList, onScheduleClick }) {
    const { getCategoryById, getCategoryColorHex } = useSchedule();
    
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
            <div className="bg-[#E6EDE4] rounded-[12px] px-[14px] py-[10px] text-[15px] text-point flex flex-col gap-[2px]">
                <span>기념일 D-day</span>
                <span className="text-[13px] text-subpoint">7월 15일 1주년</span>
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
