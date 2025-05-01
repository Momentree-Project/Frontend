import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./style.css"; // react-calendar 커스텀 스타일(요일, 타일 등)

const mockSchedules = [
    { date: "2025-04-20", title: "하루종일 누워 있기", weather: "구름 조금" },
    { date: "2025-04-24", title: "파스타 만들기", weather: "맑음" },
    { date: "2025-05-04", title: "무슨무슨 기념일", weather: "맑음" },
];

function formatDate(dateObj) {
    if (typeof dateObj === "string") return dateObj;
    return dateObj.toISOString().slice(0, 10);
}

function Schedule() {
    const [selectedDate, setSelectedDate] = useState(new Date("2025-04-24"));
    const selectedDateStr = formatDate(selectedDate);
    const today = mockSchedules.find((s) => s.date === selectedDateStr);

    return (
    < div className = "bg-mainbg min-h-screen font-noto" >
        <div className="flex flex-col gap-[28px] max-w-[420px] mx-auto py-8">
            {/* 상단 카드 */}
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
                    <span className="ml-[6px] font-bold">{today ? today.title : "일정 없음"}</span>
                    <span className="ml-auto text-[18px] text-sunshine">
                        {today ? (today.weather === "맑음" ? "☀️" : "🌤️") : ""}
                    </span>
                </div>
            </section>

            {/* 캘린더 카드 */}
            <section className="bg-cardbg rounded-[22px] shadow-[0_2px_12px_#e2e5db] px-[20px] py-[24px] flex flex-col gap-[16px] mb-0">
                {/* 캘린더 헤더 */}
                <div className="text-[17px] font-semibold text-point mb-[8px]">캘린더</div>
                {/* 캘린더 */}
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="ko-KR"
                    calendarType="gregory"
                    tileClassName={({ date, view }) => {
                        let classes = [];
                        if (mockSchedules.some((s) => s.date === formatDate(date))) classes.push("has-schedule");
                        if (view === "month") {
                            if (date.getDay() === 0) classes.push("sunday");
                            if (date.getDay() === 6) classes.push("saturday");
                        }
                        return classes.join(" ");
                    }}
                    formatDay={(_, date) => date.getDate()}
                />
                {/* 일정 리스트 */}
                <ul className="list-none p-0 m-0">
                    {mockSchedules.filter((s) => s.date === selectedDateStr).map((item, idx) => (
                        <li
                            key={idx}
                            className="bg-white rounded-[10px] px-[12px] py-[10px] mb-[8px] flex justify-between items-center text-textmain text-[15px] shadow-[0_1px_4px_#eaece3]"
                        >
                            <span>{item.title}</span>
                            <span className="text-subpoint text-[14px]">{item.weather}</span>
                        </li>
                    ))}
                    {mockSchedules.filter((s) => s.date === selectedDateStr).length === 0 && (
                        <li className="bg-white rounded-[10px] px-[12px] py-[10px] mb-[8px] flex justify-between items-center text-subpoint text-[15px] shadow-[0_1px_4px_#eaece3]">
                            일정이 없습니다.
                        </li>
                    )}
                </ul>
            </section>
        </div>
            </div >
            );
}

export default Schedule;
