import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./style.css";

const mockSchedules = [
    { date: "2025-04-20", title: "하루종일 누워 있기", weather: "구름 조금" },
    { date: "2025-04-24", title: "파스타 만들기", weather: "맑음" },
    { date: "2025-05-04", title: "무슨무슨 기념일", weather: "맑음" },
];

// 날짜 객체 → 'YYYY-MM-DD' 문자열 변환 함수
function formatDate(dateObj) {
    if (typeof dateObj === "string") return dateObj;
    return dateObj.toISOString().slice(0, 10);
}

function Schedule() {
    const [selectedDate, setSelectedDate] = useState(new Date("2025-04-24"));
    const selectedDateStr = formatDate(selectedDate);
    const today = mockSchedules.find(s => s.date === selectedDateStr);

    return (
        <div className="container">
            <section className="card greeting-card">
                <div className="date-label">{selectedDateStr.replace(/-/g, ".")}</div>
                <div className="greeting-title">안녕, 오늘의 데이트는?</div>
                <div className="d-day-box">
                    <span>기념일 D 10</span>
                    <span className="d-day-sub">7월 15일 1주년</span>
                </div>
                <div className="today-box">
                    <span>오늘</span>
                    <span className="today-title">{today ? today.title : "일정 없음"}</span>
                    <span className="today-weather">{today ? (today.weather === "맑음" ? "☀️" : "🌤️") : ""}</span>
                </div>
                {/* <button className="map-btn">데이트 지도의</button> */}
            </section>

            <section className="card calendar-card">
                <div className="calendar-header">캘린더</div>
                <Calendar
                    onChange={setSelectedDate}
                    value={selectedDate}
                    locale="ko-KR"
                    calendarType="gregory"
                    tileClassName={({ date, view }) => {
                        let classes = [];
                        if (mockSchedules.some(s => s.date === formatDate(date))) classes.push("has-schedule");
                        if (view === "month") {
                            if (date.getDay() === 0) classes.push("sunday");
                            if (date.getDay() === 6) classes.push("saturday");
                        }
                        return classes.join(" ");
                    }}
                    formatDay={(_, date) => date.getDate()}
                />
                <ul className="schedule-list">
                    {mockSchedules
                        .filter(s => s.date === selectedDateStr)
                        .map((item, idx) => (
                            <li key={idx} className="schedule-item">
                                <span>{item.title}</span>
                                <span className="schedule-weather">{item.weather}</span>
                            </li>
                        ))}
                    {mockSchedules.filter(s => s.date === selectedDateStr).length === 0 && (
                        <li className="schedule-item" style={{ color: "#a3b49b" }}>
                            일정이 없습니다.
                        </li>
                    )}
                </ul>
            </section>
        </div>
    );
}

export default Schedule;
