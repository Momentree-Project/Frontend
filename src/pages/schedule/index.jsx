import React, { useState } from "react";
import { useSchedule } from "./hooks/useSchedule";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { ScheduleList } from "./components/ScheduleList";
import { ScheduleModal } from "./components/ScheduleModal";
import { ScheduleDetailModal } from "./components/ScheduleDetailModal";
import { ScheduleEditModal } from "./components/ScheduleEditModal";
import "./style.css";

function Schedule() {
    const {
        selectedDate,
        setSelectedDate,
        selectedDateStr,
        scheduleList,
        schedules,
        hasScheduleOnDate,
        formatDate,
        loading,
        error,
        fetchSchedules,
        getScheduleDetail,
        updateSchedule,
        deleteSchedule,
        getCategoryById,
        getCategoryColorHex
    } = useSchedule();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    const handleAddClick = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        fetchSchedules();  // 모달이 닫힐 때 일정 목록 새로고침
        setIsModalOpen(false);
    };

    const handleItemClick = async (scheduleId) => {
        const scheduleDetail = await getScheduleDetail(scheduleId);
        if (scheduleDetail) {
            setSelectedSchedule(scheduleDetail);
            setIsDetailModalOpen(true);
        }
    };

    const handleEditClick = async (scheduleId) => {
        // 리스트에서 직접 수정 버튼 클릭 시
        const scheduleDetail = await getScheduleDetail(scheduleId);
        if (scheduleDetail) {
            setSelectedSchedule(scheduleDetail);
            setIsEditModalOpen(true);
        }
    };

    const handleDeleteClick = async (scheduleId) => {
        // 삭제 확인 다이얼로그
        if (window.confirm('정말로 이 일정을 삭제하시겠습니까?')) {
            const success = await deleteSchedule(scheduleId);
            if (success) {
                // 삭제 성공 시 모달 닫기
                setIsDetailModalOpen(false);
                // 일정 삭제 이벤트 발생
                window.dispatchEvent(new Event('scheduleDeleted'));
            } else {
                alert('일정 삭제에 실패했습니다.');
            }
        }
    };

    const handleEditFromDetail = (scheduleId) => {
        // 상세 모달에서 수정 버튼 클릭 시
        setIsDetailModalOpen(false);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        fetchSchedules();  // 수정 모달이 닫힐 때 일정 목록 새로고침
        setIsEditModalOpen(false);
    };

    // 로딩 상태 처리
    if (loading) return <div>로딩 중...</div>;
    if (error) return <div>에러: {error}</div>;

    return (
        <div className="bg-mainbg min-h-screen font-noto">
                <div className="flex flex-col gap-[16px] sm:gap-[28px] w-full max-w-[420px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
                    
                {/* 상단 카드 */}
                <ScheduleHeader
                    selectedDateStr={selectedDateStr}
                    scheduleList={scheduleList}
                    onScheduleClick={handleItemClick}
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
                        schedules={schedules}
                        getCategoryById={getCategoryById}
                        getCategoryColorHex={getCategoryColorHex}
                    />
                    {/* 일정 리스트 */}
                    <ScheduleList
                        scheduleList={scheduleList}
                        onItemClick={handleItemClick}
                        onEditClick={handleEditClick}
                        onDeleteClick={handleDeleteClick}
                    />
                </section>

                {/* 일정 추가 모달 */}
                <ScheduleModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    selectedDate={selectedDate}
                />

                {/* 일정 상세 모달 */}
                <ScheduleDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    schedule={selectedSchedule}
                    onEdit={handleEditFromDetail}
                    onDelete={handleDeleteClick}
                />

                {/* 일정 수정 모달 */}
                <ScheduleEditModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    schedule={selectedSchedule}
                    selectedDate={selectedDate}
                />
            </div>
        </div>
    );
}

export default Schedule;
