import React, { useState } from "react";
import { useSchedule } from "./hooks/useSchedule";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { ScheduleList } from "./components/ScheduleList";
import { ScheduleModal } from "./components/ScheduleModal";
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

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSaveSchedule = (scheduleData) => {
        // 여기서 API 호출 또는 상태 업데이트 로직을 구현
        console.log("저장된 일정:", scheduleData);
        // 실제 구현에서는 scheduleList를 업데이트하는 로직이 필요합니다
    };

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
                    <div className="flex justify-between items-center mb-[8px]">
                        <div className="text-[17px] font-semibold text-point">캘린더</div>
                        <button
                            onClick={handleAddClick}
                            className="bg-point text-white rounded-[8px] px-3 py-1 text-[14px] font-medium"
                        >
                            일정 추가
                        </button>
                    </div>

                    {/* 캘린더 */}
                    <ScheduleCalendar
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        hasScheduleOnDate={hasScheduleOnDate}
                        formatDate={formatDate}
                    />
                    {/* 일정 리스트 */}
                    <ScheduleList
                        scheduleList={scheduleList}
                        onAddClick={handleAddClick}
                    />
                </section>

                <ScheduleModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    selectedDate={selectedDate}
                    onSave={handleSaveSchedule}
                />
            </div>
        </div>
    );
}

export default Schedule;
