// ScheduleCalendar 컴포넌트 수정
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export function ScheduleCalendar({ selectedDate, setSelectedDate, hasScheduleOnDate, formatDate, schedules }) {
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
                                {scheduleInfo.multiDaySchedules.slice(0, 5).map((scheduleId, index) => (
                                    <div
                                        key={scheduleId}
                                        className={`multi-day-dot multi-day-dot-${index % 5}`}
                                    />
                                ))}
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
