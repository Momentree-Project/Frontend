import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useSchedule } from "./hooks/useSchedule";
import { ScheduleHeader } from "./components/ScheduleHeader";
import { ScheduleCalendar } from "./components/ScheduleCalendar";
import { ScheduleList } from "./components/ScheduleList";
import { ScheduleModal } from "./components/ScheduleModal";
import { ScheduleDetailModal } from "./components/ScheduleDetailModal";
import { ScheduleEditModal } from "./components/ScheduleEditModal";
import "./style.css";

function Schedule() {
    const [searchParams, setSearchParams] = useSearchParams();
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
    const [highlightScheduleId, setHighlightScheduleId] = useState(null);

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

    // URL 파라미터 처리 (통합)
    useEffect(() => {
        const scheduleIdParam = searchParams.get('highlight');
        const dateParam = searchParams.get('date');
        
        // 로딩 중이면 대기
        if (loading) return;
        
        if (scheduleIdParam) {
            const scheduleId = parseInt(scheduleIdParam);
            
            // 스케줄이 로드되었고 해당 스케줄을 찾을 수 있으면
            if (schedules.length > 0) {
                const targetSchedule = schedules.find(schedule => 
                    schedule.id === scheduleId || String(schedule.id) === String(scheduleId)
                );
                
                if (targetSchedule) {
                    // 일정의 시작 날짜로 이동
                    const scheduleDate = new Date(targetSchedule.startTime);
                    setSelectedDate(scheduleDate);
                    setHighlightScheduleId(scheduleId);
                    
                    // 5초 후 하이라이트 제거
                    setTimeout(() => {
                        setHighlightScheduleId(null);
                    }, 5000);
                }
                
                // URL에서 파라미터 제거
                setSearchParams(new URLSearchParams());
            }
        } else if (dateParam) {
            // 날짜만 전달된 경우
            const targetDate = new Date(dateParam);
            if (!isNaN(targetDate.getTime())) {
                setSelectedDate(targetDate);
                setSearchParams(new URLSearchParams());
            }
        }
    }, [searchParams, schedules, loading]);

    // 로딩 상태 처리
    if (loading) {
        return <div className="p-4 text-center">로딩 중...</div>;
    }
    if (error) {
        return <div className="p-4 text-center text-red-500">에러: {error}</div>;
    }

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
                        highlightScheduleId={highlightScheduleId}
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
