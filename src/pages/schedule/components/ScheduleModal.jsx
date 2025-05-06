import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSchedule } from "../hooks/useSchedule";
import { registerLocale } from "react-datepicker";
import ko from 'date-fns/locale/ko';

// 한국어 로케일 등록
registerLocale('ko', ko);

export function ScheduleModal({ isOpen, onClose, selectedDate }) {
    // useSchedule 훅에서 addSchedule 함수 가져오기
    const { addSchedule } = useSchedule();

    const [formData, setFormData] = useState(() => {
        const startTime = selectedDate ? new Date(selectedDate.getTime()) : new Date();
        const endTime = selectedDate ? new Date(selectedDate.getTime()) : new Date();

        if (endTime) {
            endTime.setHours(endTime.getHours() + 1);
        }

        return {
            coupleId: localStorage.getItem("coupleId"),
            categoryId: 4,
            title: "",
            content: "",
            startTime,
            endTime,
            isAllDay: false,
            location: ""
        };
    });

    // 카테고리 기능 개발되면 수정 필요함, 목록 조회 및 추가 기능 구현
    const [categories, setCategories] = useState([
        { id: 1, name: "데이트" },
        { id: 2, name: "기념일" },
        { id: 3, name: "여행" },
        { id: 4, name: "기타" }
    ]);

    useEffect(() => {
        if (selectedDate) {
            const newStartTime = new Date(selectedDate);
            const newEndTime = new Date(selectedDate);
            newEndTime.setHours(newEndTime.getHours() + 1);

            setFormData(prev => ({
                ...prev,
                startTime: newStartTime,
                endTime: newEndTime
            }));
        }
    }, [selectedDate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleDateChange = (date, field) => {
        setFormData(prev => {
            // 시작 시간을 변경하는 경우
            if (field === 'startTime') {
                // 종료 시간이 시작 시간보다 이전이면 종료 시간도 변경
                if (prev.endTime && date > prev.endTime) {
                    const newEndTime = new Date(date);
                    newEndTime.setHours(date.getHours() + 1);
                    return {
                        ...prev,
                        startTime: date,
                        endTime: newEndTime
                    };
                }
            }
            return {
                ...prev,
                [field]: date
            };
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // 하루종일 체크된 경우 시간 조정
        let startTime = formData.startTime;
        let endTime = formData.endTime;

        if (formData.isAllDay) {
            startTime = new Date(startTime);
            startTime.setHours(0, 0, 0, 0);

            endTime = new Date(startTime);
            endTime.setHours(23, 59, 59, 999);
        }

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

        const scheduleData = {
            ...formData,
            startTime: formatDateTime(startTime),
            endTime: formatDateTime(endTime)
        };

        // useSchedule 훅의 addSchedule 함수 사용
        const success = await addSchedule(scheduleData);

        if (success) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-[16px] p-5 w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[18px] font-bold text-point">일정 추가</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-[14px] font-medium text-textmain mb-1">제목</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[14px] font-medium text-textmain mb-1">카테고리</label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        {formData.isAllDay ? (
                            <div>
                                <label className="block text-[14px] font-medium text-textmain mb-1">날짜</label>
                                <DatePicker
                                    selected={formData.startTime}
                                    onChange={(date) => handleDateChange(date, 'startTime')}
                                    dateFormat="yyyy년 MM월 dd일"
                                    dateFormatCalendar="yyyy년 MM월"
                                    className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                                    locale="ko"
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[14px] font-medium text-textmain mb-1">시작 시간</label>
                                    <DatePicker
                                        selected={formData.startTime}
                                        onChange={(date) => handleDateChange(date, 'startTime')}
                                        showTimeSelect
                                        dateFormat="yyyy년 MM월 dd일 HH:mm"
                                        dateFormatCalendar="yyyy년 MM월"
                                        className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                                        locale="ko"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[14px] font-medium text-textmain mb-1">종료 시간</label>
                                    <DatePicker
                                        selected={formData.endTime}
                                        onChange={(date) => handleDateChange(date, 'endTime')}
                                        showTimeSelect
                                        dateFormat="yyyy년 MM월 dd일 HH:mm"
                                        dateFormatCalendar="yyyy년 MM월"
                                        className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                                        minDate={formData.startTime}
                                        filterTime={(time) => {
                                            if (formData.startTime && formData.endTime &&
                                                formData.startTime.toDateString() === formData.endTime.toDateString()) {
                                                return time >= formData.startTime;
                                            }
                                            return true;
                                        }}
                                        locale="ko"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                id="isAllDay"
                                name="isAllDay"
                                checked={formData.isAllDay}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label htmlFor="isAllDay" className="text-[14px] font-medium text-textmain">
                                하루종일
                            </label>
                        </div>
                    </div>


                    <div className="mb-4">
                        <label className="block text-[14px] font-medium text-textmain mb-1">장소</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-[14px] font-medium text-textmain mb-1">내용</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 px-4 py-2 border border-[#E6EDE4] rounded-[8px] text-textmain"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-point text-white rounded-[8px] hover:bg-opacity-90"
                        >
                            저장
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
