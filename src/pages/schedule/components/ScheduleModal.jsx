import { useState, useEffect } from "react";
import api from '../../../api/axiosInstance';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export function ScheduleModal({ isOpen, onClose, selectedDate, onSave }) {
    const [formData, setFormData] = useState({
        coupleId: localStorage.getItem("coupleId"),
        categoryId: 4, // 기본값
        title: "",
        content: "",
        startTime: selectedDate ? new Date(selectedDate) : new Date(),
        endTime: selectedDate ? new Date(selectedDate.setHours(selectedDate.getHours() + 1)) : new Date(new Date().setHours(new Date().getHours() + 1)),
        isAllDay: false,
        location: ""
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
        setFormData(prev => ({
            ...prev,
            [field]: date
        }));
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

        const scheduleData = {
            ...formData,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        };

        try {
            // api 인스턴스 사용 (토큰은 인터셉터에서 자동으로 추가됨)
            const response = await api.post('/api/v1/schedules', scheduleData);

            if (response.status === 200) {
                onSave(scheduleData);
                onClose();
            }
        } catch (error) {
            console.error('일정 추가 실패:', error);
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
                        <div className="flex items-center mb-2">
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[14px] font-medium text-textmain mb-1">시작 시간</label>
                                <DatePicker
                                    selected={formData.startTime}
                                    onChange={(date) => handleDateChange(date, 'startTime')}
                                    showTimeSelect={!formData.isAllDay}
                                    dateFormat={formData.isAllDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm"}
                                    className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                                />
                            </div>

                            <div>
                                <label className="block text-[14px] font-medium text-textmain mb-1">종료 시간</label>
                                <DatePicker
                                    selected={formData.endTime}
                                    onChange={(date) => handleDateChange(date, 'endTime')}
                                    showTimeSelect={!formData.isAllDay}
                                    dateFormat={formData.isAllDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm"}
                                    className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                                />
                            </div>
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
