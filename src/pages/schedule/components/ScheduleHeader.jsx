export function ScheduleHeader({ selectedDateStr, scheduleList }) {
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

    // 일정 시간 범위 표시 함수 - 여러 날짜에 걸친 일정과 하루짜리 일정 처리
    const formatTimeRange = (schedule) => {
        if (schedule.isAllDay) {
            return <span className="text-[12px] text-point bg-[#F5F8F3] px-2 py-0.5 rounded-full inline-block">종일</span>;
        }

        const startDate = new Date(schedule.startTime);
        const endDate = new Date(schedule.endTime);
        const selectedDate = new Date(selectedDateStr);
        
        // 시작일과 종료일이 같은지 확인 (하루짜리 일정)
        const isSameDay = startDate.getFullYear() === endDate.getFullYear() && 
                          startDate.getMonth() === endDate.getMonth() && 
                          startDate.getDate() === endDate.getDate();

        if (isSameDay) {
            // 하루짜리 일정
            return (
                <span className="text-[12px] text-subpoint flex items-center">
                    <span className="text-[11px] mr-1">🕒</span>
                    {formatTime(schedule.startTime)} ~ {formatTime(schedule.endTime)}
                </span>
            );
        } else {
            // 여러 날짜에 걸친 일정
            const selectedDateOnly = new Date(selectedDate);
            selectedDateOnly.setHours(0, 0, 0, 0);
            
            const startDateOnly = new Date(startDate);
            startDateOnly.setHours(0, 0, 0, 0);
            
            const endDateOnly = new Date(endDate);
            endDateOnly.setHours(0, 0, 0, 0);
            
            // 선택된 날짜가 시작일인 경우
            if (selectedDateOnly.getTime() === startDateOnly.getTime()) {
                return (
                    <span className="text-[12px] text-subpoint flex items-center">
                        <span className="text-[11px] mr-1">🕒</span>
                        {formatTime(schedule.startTime)} ~ {formatDate(schedule.endTime)} {formatTime(schedule.endTime)}
                    </span>
                );
            } 
            // 선택된 날짜가 종료일인 경우
            else if (selectedDateOnly.getTime() === endDateOnly.getTime()) {
                return (
                    <span className="text-[12px] text-subpoint flex items-center">
                        <span className="text-[11px] mr-1">🕒</span>
                        {formatDate(schedule.startTime)} {formatTime(schedule.startTime)} ~ {formatTime(schedule.endTime)}
                    </span>
                );
            } 
            // 선택된 날짜가 중간에 있는 경우
            else {
                return (
                    <span className="text-[12px] text-subpoint flex items-center">
                        <span className="text-[11px] mr-1">🕒</span>
                        {formatDate(schedule.startTime)} {formatTime(schedule.startTime)} ~ {formatDate(schedule.endTime)} {formatTime(schedule.endTime)}
                    </span>
                );
            }
        }
    };

    // 일정 유형에 따른 색상 지정 - 더 부드러운 파스텔 톤으로 변경
    const getScheduleColor = (index) => {
        // 부드러운 파스텔 톤 색상
        const colors = [
            '#9DC08B', // 부드러운 녹색
            '#B1C9E8', // 연한 파랑
            '#F8C4B4', // 연한 코랄
            '#E5BEEC', // 연한 라벤더
            '#FFD89C'  // 연한 노랑
        ];
        return colors[index % colors.length];
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
                                className="px-[16px] py-[10px] hover:bg-gray-50 transition-colors border-l-[3px]"
                                style={{ borderLeftColor: getScheduleColor(index) }}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[15px] font-medium text-textmain">{schedule.title}</span>
                                    <span className="text-[18px]">
                                        {schedule.weather === "맑음" ? "☀️" :
                                            schedule.weather === "흐림" ? "🌤️" :
                                                schedule.weather === "비" ? "🌧️" : ""}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-1">
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
