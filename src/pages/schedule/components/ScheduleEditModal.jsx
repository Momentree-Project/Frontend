import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from '../../../api/axiosInstance';
import "../../../styles/datepicker-custom.css";
import { registerLocale } from "react-datepicker";
import ko from 'date-fns/locale/ko';
import { useSchedule } from "../hooks/useSchedule";

// 한국어 로케일 등록
registerLocale('ko', ko);

export function ScheduleEditModal({ isOpen, onClose, schedule, selectedDate }) {
    const { 
        categories, fetchCategories, usedColors, isColorAvailable, 
        findCategoryByColor, findFirstAvailableColor, getCategoryColorHex, 
        addOrUpdateCategory, deleteCategory, categoryColors, categoryColorMap,
        refreshCategories, getCategoryById
    } = useSchedule();

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        location: '',
        startTime: '',
        endTime: '',
        isAllDay: false,
        categoryId: '' // 카테고리 ID 추가
    });

    // 카테고리 추가 관련 상태
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [isCategoryAddMode, setIsCategoryAddMode] = useState(true); // true: 추가 모드, false: 수정 모드
    const [newCategory, setNewCategory] = useState({
        name: "",
        color: "" // 기본 색상 없음
    });

    // DatePicker용 Date 객체 상태
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // 모달이 열릴 때 카테고리 목록 가져오기
    useEffect(() => {
        if (isOpen) {
            refreshCategories();
        }
    }, [isOpen, refreshCategories]);

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
                categoryId: schedule.categoryId || '' // 카테고리 ID 설정
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
        const { name, value, type, checked } = e.target;
        
        // 카테고리 추가 옵션 선택 시
        if (name === "categoryId" && value === "add_new") {
            // 최신 카테고리 목록 조회
            refreshCategories();
            
            // 카테고리 폼 초기화
            let initialColor = "";
            
            // 사용 가능한 색상 확인
            const availableColor = findFirstAvailableColor();
            if (availableColor) {
                initialColor = availableColor;
            } else {
                // 사용 가능한 색상이 없으면 첫 번째 카테고리의 색상을 선택 (수정 목적)
                if (categories.length > 0) {
                    initialColor = categories[0].color;
                } else {
                    // 카테고리가 없는 경우 첫 번째 색상 선택
                    initialColor = Object.keys(categoryColorMap)[0];
                }
            }
            
            // 새 카테고리 폼을 표시하면서 기본값 설정
            setNewCategory({
                name: "",
                color: initialColor
            });
            
            // 수정 모드인지 확인 (색상이 이미 사용 중인 경우)
            const isEditMode = !isColorAvailable(initialColor);
            if (isEditMode && initialColor) {
                const existingCategory = findCategoryByColor(initialColor);
                if (existingCategory) {
                    setNewCategory({
                        name: existingCategory.name,
                        color: initialColor
                    });
                }
                setIsCategoryAddMode(false); // 수정 모드로 설정
            } else {
                setIsCategoryAddMode(true); // 추가 모드로 설정
            }
            
            setShowCategoryForm(true);
            return;
        }
        
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value
        });
    };

    const handleCategoryInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 카테고리 추가 또는 수정 함수
    const handleAddCategory = async () => {
        if (!newCategory.name.trim()) {
            alert('카테고리 이름을 입력해주세요.');
            return;
        }

        if (!newCategory.color) {
            alert('카테고리 색상을 선택해주세요.');
            return;
        }

        const result = await addOrUpdateCategory(newCategory);
        
        if (result.success) {
            // 성공적으로 저장된 경우
            if (result.data) {
                // 현재 선택된 카테고리를 새로 추가/수정한 카테고리로 변경
                setFormData(prev => ({
                    ...prev,
                    categoryId: result.data.id
                }));
            }
            
            // 카테고리 폼 초기화 및 닫기
            resetCategoryForm();
        } else {
            // 실패 시 오류 메시지 표시
            alert(result.message || '카테고리 저장에 실패했습니다.');
        }
    };
    
    // 카테고리 폼 초기화 및 닫기
    const resetCategoryForm = () => {
        setShowCategoryForm(false);
        setNewCategory({ name: "", color: "" });
        setIsCategoryAddMode(true); // 추가 모드로 초기화
    };

    // 카테고리 삭제 처리 함수
    const handleDeleteCategory = async () => {
        const categoryToDelete = findCategoryByColor(newCategory.color);
        if (!categoryToDelete) return;
        
        // 사용자 확인
        if (!confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
            return;
        }
        
        const result = await deleteCategory(categoryToDelete.id);
        
        if (result.success) {
            // 삭제된 카테고리가 현재 선택된 카테고리인 경우 카테고리 선택 해제
            if (formData.categoryId === categoryToDelete.id) {
                setFormData(prev => ({
                    ...prev,
                    categoryId: ""
                }));
            }
            
            // 카테고리 폼 초기화 및 닫기
            resetCategoryForm();
        } else {
            alert(result.message || '카테고리 삭제에 실패했습니다.');
        }
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

    // 모든 색상 사용 가능 여부 확인
    const hasAvailableColors = Object.keys(categoryColorMap).some(color => isColorAvailable(color));

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
                        <label className="block text-[16px] font-semibold mb-1">카테고리</label>
                        {!showCategoryForm ? (
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-[8px] px-3 py-2"
                            >
                                <option value="">카테고리 없음</option>
                                {categories.length > 0 && categories.map(category => {
                                    const colorHex = getCategoryColorHex(category.color);
                                    return (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    );
                                })}
                                <option value="add_new">+ 새 카테고리 추가/수정</option>
                            </select>
                        ) : (
                            <div className="border border-[#E6EDE4] rounded-[8px] p-3 bg-[#F9FBF8]">
                                <div className="mb-2">
                                    <label className="block text-[13px] font-medium text-textmain mb-1">카테고리 이름</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={newCategory.name}
                                        onChange={handleCategoryInputChange}
                                        className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                                        placeholder="카테고리 이름 입력"
                                    />
                                    {!isColorAvailable(newCategory.color) && newCategory.color && (
                                        <p className="mt-1 text-[12px] text-gray-600 bg-[#F5F5F5] p-2 rounded">
                                            <span className="font-medium text-point">수정 모드:</span> 현재 "{findCategoryByColor(newCategory.color)?.name}" 카테고리의 색상입니다.
                                            {isCategoryAddMode ? 
                                                <span className="block mt-1 text-[11px]">이름을 입력하면 카테고리를 수정할 수 있습니다. 이름을 비워두면 삭제할 수 있습니다.</span>
                                                : null
                                            }
                                        </p>
                                    )}
                                </div>
                                
                                <div className="mb-3">
                                    <label className="block text-[13px] font-medium text-textmain mb-1">색상 선택</label>
                                    {!hasAvailableColors && (
                                        <div className="mb-2 text-[12px] text-gray-600 bg-[#FFEAEA] p-2 rounded">
                                            <span className="font-medium text-[#E07474]">알림:</span> 모든 색상이 이미 사용 중입니다. 
                                            <span className="block mt-1">카테고리를 수정하거나 삭제할 수 있습니다.</span>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-4 gap-2">
                                        {categoryColors.map((color) => (
                                            <button
                                                key={color.colorName}
                                                type="button"
                                                className={`flex items-center py-1 px-2 rounded-md 
                                                    ${newCategory.color === color.colorName 
                                                        ? 'ring-2 ring-point bg-[#F0F5ED]' 
                                                        : !isColorAvailable(color.colorName)
                                                            ? 'bg-[#F5F5F5] hover:bg-[#F0F0F0] border border-gray-300' 
                                                            : 'bg-white hover:bg-[#F9FBF8]'}`}
                                                onClick={() => {
                                                    // 색상 선택
                                                    setNewCategory(prev => ({ ...prev, color: color.colorName }));
                                                    
                                                    // 사용 중인 색상이면 해당 카테고리 이름 자동 입력 (수정 모드)
                                                    if (!isColorAvailable(color.colorName)) {
                                                        const categoryWithColor = findCategoryByColor(color.colorName);
                                                        if (categoryWithColor) {
                                                            setNewCategory(prev => ({ 
                                                                ...prev, 
                                                                color: color.colorName,
                                                                name: categoryWithColor.name 
                                                            }));
                                                            setIsCategoryAddMode(false); // 수정 모드로 설정
                                                        }
                                                    } else {
                                                        // 사용 중이지 않은 색상이면 이름 초기화 (추가 모드)
                                                        setNewCategory(prev => ({ 
                                                            ...prev, 
                                                            color: color.colorName,
                                                            name: "" 
                                                        }));
                                                        setIsCategoryAddMode(true); // 추가 모드로 설정
                                                    }
                                                }}
                                            >
                                                <span 
                                                    className="w-4 h-4 rounded-full mr-2" 
                                                    style={{ backgroundColor: color.hex }}
                                                ></span>
                                                <span className="text-[12px]">{color.displayName}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={resetCategoryForm}
                                        className="px-3 py-1 text-[13px] text-subpoint"
                                    >
                                        취소
                                    </button>
                                    
                                    {/* 추가 모드인 경우 (항상 추가 버튼 표시) */}
                                    {isCategoryAddMode ? (
                                        <button
                                            type="button"
                                            onClick={handleAddCategory}
                                            className={`px-3 py-1 bg-point text-white rounded-[6px] text-[13px] 
                                                ${(!newCategory.name.trim() || !newCategory.color) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={!newCategory.name.trim() || !newCategory.color}
                                        >
                                            추가
                                        </button>
                                    ) : (
                                        /* 수정 모드인 경우 - 이름이 비어있으면 삭제 버튼, 아니면 수정 버튼 */
                                        newCategory.name.trim() === "" ? (
                                            <button
                                                type="button"
                                                onClick={handleDeleteCategory}
                                                className="px-3 py-1 bg-[#FFEBEB] text-[#E07474] hover:bg-[#FFE0E0] hover:text-[#D05A5A] rounded-[6px] text-[13px] font-medium"
                                            >
                                                삭제
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleAddCategory}
                                                className={`px-3 py-1 bg-point text-white rounded-[6px] text-[13px]`}
                                            >
                                                수정
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 현재 선택된 카테고리 표시 */}
                    {!showCategoryForm && formData.categoryId && formData.categoryId !== "" && (
                        <div className="mb-4">
                            {(() => {
                                // 선택된 카테고리 찾기
                                const selectedCategory = categories.find(category => category.id == formData.categoryId);
                                
                                if (selectedCategory) {
                                    return (
                                        <div className="flex items-center text-[14px] text-textmain">
                                            <span 
                                                className="inline-block w-3 h-3 rounded-full mr-2" 
                                                style={{ backgroundColor: getCategoryColorHex(selectedCategory.color) }}
                                            ></span>
                                            <span>선택된 카테고리: {selectedCategory.name}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                        </div>
                    )}

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
                                    dateFormat="yyyy년 MM월 dd일 HH:mm"
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
                                    dateFormat="yyyy년 MM월 dd일 HH:mm"
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
