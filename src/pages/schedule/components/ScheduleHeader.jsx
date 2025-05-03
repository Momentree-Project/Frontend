export function ScheduleHeader({ selectedDateStr, todaySchedule }) {
    return (
        <section className="bg-cardbg rounded-[22px] shadow-[0_2px_12px_#e2e5db] px-[20px] py-[24px] flex flex-col gap-[16px] mb-0">
            {/* 날짜 */}
            <div className="text-[16px] text-subpoint mb-[4px]">{selectedDateStr.replace(/-/g, ".")}</div>
            {/* 인사말 */}
            <div className="text-[20px] font-bold text-textmain mb-[8px]">안녕, 오늘의 데이트는?</div>
            {/* D-day 박스 */}
            <div className="bg-[#E6EDE4] rounded-[12px] px-[14px] py-[10px] text-[15px] text-point flex flex-col gap-[2px]">
                <span>기념일 D 10</span>
                <span className="text-[13px] text-subpoint">7월 15일 1주년</span>
            </div>
            {/* 오늘 일정 */}
            <div className="bg-[#F9FAF7] rounded-[12px] px-[14px] py-[12px] flex items-center gap-[10px] text-[16px] text-point font-medium">
                <span>오늘</span>
                <span className="ml-[6px] font-bold">{todaySchedule ? todaySchedule.title : "일정 없음"}</span>
                <span className="ml-auto text-[18px] text-sunshine">
                    {todaySchedule ? (todaySchedule.weather === "맑음" ? "☀️" : "🌤️") : ""}
                </span>
            </div>
        </section>
    );
}