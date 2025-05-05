import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

export function ScheduleCalendar({ selectedDate, setSelectedDate, hasScheduleOnDate, formatDate }) {
    return (
        <div className="flex justify-center">
            <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                locale="ko-KR"
                calendarType="gregory"
                tileClassName={({ date, view }) => {
                    let classes = [];
                    if (hasScheduleOnDate(date)) classes.push("has-schedule");
                    if (view === "month") {
                        if (date.getDay() === 0) classes.push("sunday");
                        if (date.getDay() === 6) classes.push("saturday");
                    }
                    return classes.join(" ");
                }}
                formatDay={(_, date) => date.getDate()}
            />
        </div>
    );
}
