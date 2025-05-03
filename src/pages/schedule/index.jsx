import React from "react";
import { useSchedule } from "./hooks/useSchedule";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { ScheduleList } from "./components/ScheduleList";
import "./style.css";

function Schedule() {
    const {
        selectedDate,
        setSelectedDate,
        selectedDateStr,
        todaySchedule,
        scheduleList,
        hasScheduleOnDate,
        formatDate,
    } = useSchedule();

    return (
        <div className="bg-mainbg min-h-screen font-noto">
            <div className="flex flex-col gap-[28px] max-w-[420px] mx-auto py-8">
                {/* 상단 카드 */}
                <ScheduleHeader
                    selectedDateStr={selectedDateStr}
                    todaySchedule={todaySchedule}
                />

                {/* 캘린더 카드 */}
                <section className="bg-cardbg rounded-[22px] shadow-[0_2px_12px_#e2e5db] px-[20px] py-[24px] flex flex-col gap-[16px] mb-0">
                    {/* 캘린더 헤더 */}
                    <div className="text-[17px] font-semibold text-point mb-[8px]">캘린더</div>
                    {/* 캘린더 */}
                    <ScheduleCalendar
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        hasScheduleOnDate={hasScheduleOnDate}
                        formatDate={formatDate}
                    />
                    {/* 일정 리스트 */}
                    <ScheduleList scheduleList={scheduleList} />
                </section>
            </div>
        </div>
    );
}

export default Schedule;
