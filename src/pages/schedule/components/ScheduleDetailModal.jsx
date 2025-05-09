import { useState, useEffect, useCallback } from "react";
import { useSchedule } from "../hooks/useSchedule";

export function ScheduleDetailModal({ isOpen, onClose, schedule, onEdit, onDelete }) {
    const { getCategoryById, getCategoryColorHex, categories } = useSchedule();
    const [category, setCategory] = useState(null);

    // 디버깅용 로그
    useEffect(() => {
        if (schedule) {
            console.log('원본 schedule 객체:', schedule);
            console.log('카테고리 목록:', categories);
        }
    }, [schedule, categories]);

    // 카테고리 정보 로드 함수
    const loadCategory = useCallback(() => {
        if (schedule && schedule.categoryId) {
            console.log('카테고리 ID:', schedule.categoryId);
            console.log('카테고리 ID 타입:', typeof schedule.categoryId);
            
            const categoryInfo = getCategoryById(schedule.categoryId);
            console.log('찾은 카테고리 정보:', categoryInfo);
            
            if (categoryInfo) {
                setCategory(categoryInfo);
            } else {
                console.log('카테고리를 찾을 수 없음');
                setCategory(null);
            }
        } else {
            console.log('카테고리 ID가 없음:', schedule);
            setCategory(null);
        }
    }, [schedule?.categoryId, getCategoryById]);

    useEffect(() => {
        if (isOpen) {
            loadCategory();
        }
    }, [isOpen, loadCategory]);

    if (!isOpen || !schedule) return null;

    // 날짜 포맷팅 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // 시간 포맷팅 함수 (오전/오후 표시)
    const formatTime = (dateString) => {
        if (!dateString) return '';

        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? '오후' : '오전';
        const formattedHours = hours % 12 || 12; // 12시간제로 변환 (0은 12로)
        const formattedMinutes = minutes.toString().padStart(2, '0');

        return `${ampm} ${formattedHours}시 ${formattedMinutes}분`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[22px] p-6 w-full max-w-[380px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[20px] font-bold text-point">일정 상세</h3>
                    <button onClick={onClose} className="text-gray-500">
                        <span className="text-xl">×</span>
                    </button>
                </div>

                <div className="mb-4">
                    <h4 className="text-[16px] font-semibold mb-1">제목</h4>
                    <p className="text-[16px]">{schedule.title}</p>
                </div>

                <div className="mb-4">
                    <h4 className="text-[16px] font-semibold mb-1">카테고리</h4>
                    {category ? (
                        <div className="flex items-center">
                            <div 
                                className="flex items-center px-2 py-1 rounded-[6px]"
                                style={{ backgroundColor: `${getCategoryColorHex(category.color)}20` }}
                            >
                                <span 
                                    className="inline-block w-3 h-3 rounded-full mr-2" 
                                    style={{ backgroundColor: getCategoryColorHex(category.color) }}
                                ></span>
                                <p className="text-[14px] font-medium">{category.name}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-[14px] text-gray-500">카테고리 없음</p>
                    )}
                </div>

                <div className="mb-4">
                    <h4 className="text-[16px] font-semibold mb-1">
                        {schedule.isAllDay ? "날짜" : "날짜"}
                    </h4>
                    <p className="text-[16px]">{formatDate(schedule.startTime)}</p>
                </div>

                {!schedule.isAllDay && (
                    <div className="mb-4">
                        <h4 className="text-[16px] font-semibold mb-1">시간</h4>
                        <p className="text-[16px]">
                            {formatTime(schedule.startTime)}
                            {schedule.endTime && ` ~ ${formatTime(schedule.endTime)}`}
                        </p>
                    </div>
                )}

                {schedule.content && (
                    <div className="mb-4">
                        <h4 className="text-[16px] font-semibold mb-1">내용</h4>
                        <p className="text-[16px]">{schedule.content}</p>
                    </div>
                )}

                {schedule.location && (
                    <div className="mb-4">
                        <h4 className="text-[16px] font-semibold mb-1">장소</h4>
                        <p className="text-[16px]">{schedule.location}</p>
                    </div>
                )}

                <div className="mb-4">
                    <h4 className="text-[16px] font-semibold mb-1">날씨</h4>
                    <p className="text-[16px]">{schedule.weather || '정보 없음'}</p>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={() => onEdit(schedule.id)}
                        className="bg-point hover:bg-[#435045] text-white rounded-[8px] px-4 py-2 text-[14px] font-medium transition-colors"
                    >
                        수정
                    </button>
                    <button
                        onClick={() => onDelete(schedule.id)}
                        className="bg-[#E07474] hover:bg-[#D05A5A] text-white rounded-[8px] px-4 py-2 text-[14px] font-medium transition-colors"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}
