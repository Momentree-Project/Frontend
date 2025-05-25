// ScheduleCalendar 컴포넌트 수정
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export function ScheduleCalendar({ selectedDate, setSelectedDate, hasScheduleOnDate, formatDate, schedules, getCategoryById, getCategoryColorHex }) {
    return (
        <div className="flex justify-center">
            <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                locale="ko-KR"
                calendarType="gregory"
                tileClassName={({ date, view }) => {
                    let classes = [];

                    const scheduleInfo = hasScheduleOnDate(date);

                    if (scheduleInfo.hasSingleDay) {
                        classes.push("has-schedule");
                        classes.push("single-day-schedule");
                    }

                    if (view === "month") {
                        if (date.getDay() === 0) classes.push("sunday");
                        if (date.getDay() === 6) classes.push("saturday");
                    }

                    return classes.join(" ");
                }}
                tileContent={({ date, view }) => {
                    const scheduleInfo = hasScheduleOnDate(date);

                    if (scheduleInfo.multiDaySchedules && scheduleInfo.multiDaySchedules.length > 0) {
                        return (
                            <div className="multi-day-dots">
                                {scheduleInfo.multiDaySchedules.slice(0, 5).map((scheduleId, index) => {
                                    // 일정 ID로 일정 객체 찾기
                                    const schedule = schedules.find(s => s.id === scheduleId);
                                    // 카테고리 색상 가져오기
                                    let dotStyle = {};
                                    
                                    if (schedule && schedule.categoryId) {
                                        const category = getCategoryById(schedule.categoryId);
                                        if (category && category.color) {
                                            dotStyle = {
                                                backgroundColor: getCategoryColorHex(category.color)
                                            };
                                        }
                                    }
                                    
                                    // 색상이 없는 경우 기본 클래스 사용
                                    const className = dotStyle.backgroundColor 
                                        ? "multi-day-dot" 
                                        : `multi-day-dot multi-day-dot-${index % 5}`;
                                    
                                    return (
                                        <div
                                            key={scheduleId}
                                            className={className}
                                            style={dotStyle}
                                        />
                                    );
                                })}
                            </div>
                        );
                    }

                    return null;
                }}
                formatDay={(_, date) => date.getDate()}
            />
        </div>
    );
}
