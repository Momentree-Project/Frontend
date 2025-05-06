import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from '../../../api/axiosInstance';
import "../../../styles/datepicker-custom.css";
import { registerLocale } from "react-datepicker";
import ko from 'date-fns/locale/ko';

// 한국어 로케일 등록
registerLocale('ko', ko);

export function ScheduleEditModal({ isOpen, onClose, schedule, selectedDate }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        location: '',
        startTime: '',
        endTime: '',
        isAllDay: false,
    });

    // DatePicker용 Date 객체 상태
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // 모달이 열릴 때 기존 일정 데이터로 폼 초기화
    useEffect(() => {
        if (isOpen && schedule) {
            setFormData({
                title: schedule.title || '',
                content: schedule.content || '  ',
                location: schedule.location || '',
                startTime: schedule.startTime || '',
                endTime: schedule.endTime || '',
                isAllDay: schedule.isAllDay || false,
            });

            // Date 객체로 변환
            if (schedule.startTime) {
                setStartDate(new Date(schedule.startTime));
            }
            if (schedule.endTime) {
                setEndDate(new Date(schedule.endTime));
            }
        }
    }, [isOpen, schedule]);

    // 날짜/시간 변경 핸들러
    const handleStartDateChange = (date) => {
        setStartDate(date);

        // 날짜와 시간을 직접 포맷팅하는 함수 추가
        const formatDateTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        setFormData({
            ...formData,
            startTime: date ? formatDateTime(date) : ''
        });

        // 종료 시간이 시작 시간보다 이전이면 종료 시간도 변경
        if (endDate && date > endDate) {
            setEndDate(date);
            setFormData(prev => ({
                ...prev,
                endTime: date ? formatDateTime(date) : ''
            }));
        }
    };


    const handleEndDateChange = (date) => {
        setEndDate(date);

        // 날짜와 시간을 직접 포맷팅하는 함수
        const formatDateTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        setFormData({
            ...formData,
            endTime: date ? formatDateTime(date) : ''
        });
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 서버에 보낼 데이터 준비
        const dataToSubmit = { ...formData };

        // 날짜와 시간을 직접 포맷팅하는 함수
        const formatDateTime = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        };

        // 종일 일정인 경우, 시간 정보 추가
        if (formData.isAllDay) {
            if (startDate) {
                const startDateCopy = new Date(startDate);
                startDateCopy.setHours(0, 0, 0, 0);
                dataToSubmit.startTime = formatDateTime(startDateCopy);

                const endDateCopy = new Date(startDateCopy);
                endDateCopy.setHours(23, 59, 59, 999);
                dataToSubmit.endTime = formatDateTime(endDateCopy);
            }
        }

        try {
            const response = await api.patch(`/api/v1/schedules?scheduleId=${schedule.id}`, dataToSubmit);
            if (response.status === 200) {
                onClose();
                window.dispatchEvent(new Event('scheduleUpdated'));
            }
        } catch (error) {
            console.error('일정 수정 실패:', error);
            alert('일정 수정에 실패했습니다.');
        }
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[22px] p-6 w-full max-w-[380px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[20px] font-bold text-point">일정 수정</h3>
                    <button onClick={onClose} className="text-gray-500">
                        <span className="text-xl">×</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-[16px] font-semibold mb-1">제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-[8px] px-3 py-2"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[16px] font-semibold mb-1">내용</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-[8px] px-3 py-2"
                            rows="3"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[16px] font-semibold mb-1">장소</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-[8px] px-3 py-2"
                        />
                    </div>

                    {formData.isAllDay ? (
                        <div className="mb-4">
                            <label className="block text-[16px] font-semibold mb-1">날짜</label>
                            <DatePicker
                                selected={startDate}
                                onChange={handleStartDateChange}
                                dateFormat="yyyy-MM-dd"
                                className="w-full border border-gray-300 rounded-[8px] px-3 py-2"
                                required
                            />
                        </div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-[16px] font-semibold mb-1">시작 시간</label>
                                <DatePicker
                                    selected={startDate}
                                    onChange={handleStartDateChange}
                                    showTimeSelect
                                    timeIntervals={30}
                                    timeCaption="시간"
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    dateFormatCalendar="yyyy년 MM월"
                                    className="w-full border border-gray-300 rounded-[8px] px-3 py-2"
                                    locale="ko"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-[16px] font-semibold mb-1">종료 시간</label>
                                <DatePicker
                                    selected={endDate}
                                    onChange={handleEndDateChange}
                                    showTimeSelect
                                    timeIntervals={30}
                                    timeCaption="시간"
                                    dateFormat="yyyy-MM-dd HH:mm"
                                    dateFormatCalendar="yyyy년 MM월"
                                    className="w-full border border-gray-300 rounded-[8px] px-3 py-2"
                                    minDate={startDate}
                                    filterTime={(time) => {
                                        // 같은 날짜인 경우에만 시간 필터링 적용
                                        if (startDate && endDate &&
                                            startDate.toDateString() === endDate.toDateString()) {
                                            // 시작 시간보다 이전 시간은 선택 불가
                                            return time >= startDate;
                                        }
                                        // 다른 날짜인 경우 모든 시간 선택 가능
                                        return true;
                                    }}
                                    locale="ko"
                                />
                            </div>
                        </>
                    )}

                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                name="isAllDay"
                                checked={formData.isAllDay}
                                onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                                className="mr-2"
                            />
                            <span className="text-[16px] font-semibold">하루 종일</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 text-gray-700 rounded-[8px] px-4 py-2 text-[14px] font-medium"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="bg-point text-white rounded-[8px] px-4 py-2 text-[14px] font-medium"
                        >
                            수정 완료
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
