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
        loading,
        error,
        fetchSchedules,
    } = useSchedule();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleAddClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        fetchSchedules();  // 모달이 닫힐 때 일정 목록 새로고침
        setIsModalOpen(false);
    };

    // 로딩 상태 처리
    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러: {error}</div>;

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
                />
            </div>
        </div>
    );
}

export default Schedule;
