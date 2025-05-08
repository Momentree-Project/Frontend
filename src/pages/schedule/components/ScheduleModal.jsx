import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSchedule } from "../hooks/useSchedule";
import { registerLocale } from "react-datepicker";
import ko from 'date-fns/locale/ko';
import api from '../../../api/axiosInstance';

// 한국어 로케일 등록
registerLocale('ko', ko);

// CategoryColor enum에 맞는 색상 객체
const categoryColorMap = {
    RED: { colorName: "RED", hex: "#FF9494", displayName: "빨간색" },
    ORANGE: { colorName: "ORANGE", hex: "#FFBD9B", displayName: "주황색" },
    YELLOW: { colorName: "YELLOW", hex: "#FFD89C", displayName: "노란색" },
    GREEN: { colorName: "GREEN", hex: "#9DC08B", displayName: "초록색" },
    BLUE: { colorName: "BLUE", hex: "#7FBCD2", displayName: "파란색" },
    INDIGO: { colorName: "INDIGO", hex: "#A0C4FF", displayName: "남색" },
    VIOLET: { colorName: "VIOLET", hex: "#E5BEEC", displayName: "보라색" }
};

// 색상 배열
const categoryColors = Object.values(categoryColorMap);

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
            categoryId: "", // 초기에는 빈 값으로 설정
            title: "",
            content: "",
            startTime,
            endTime,
            isAllDay: false,
            location: ""
        };
    });

    // 카테고리 관련 상태
    const [categories, setCategories] = useState([]);
    
    // 이미 사용 중인 색상 추적
    const [usedColors, setUsedColors] = useState([]);
    
    // 카테고리 추가 관련 상태
    const [showCategoryForm, setShowCategoryForm] = useState(false);
    const [isCategoryAddMode, setIsCategoryAddMode] = useState(true); // true: 추가 모드, false: 수정 모드
    const [newCategory, setNewCategory] = useState({
        name: "",
        color: "" // 기본 색상 없음
    });

    // 카테고리 목록 및 사용 중인 색상 가져오기
    const fetchCategories = async () => {
        try {
            // API 요청으로 카테고리 목록 가져오기
            const response = await api.get('/api/v1/categories');
            if (response.status === 200) {
                const categoryData = response.data.data || [];
                setCategories(categoryData);
                
                // 사용 중인 색상 목록 업데이트
                const colors = categoryData.map(cat => cat.color);
                setUsedColors(colors);
            }
        } catch (error) {
            console.error('카테고리 조회 실패:', error);
            // 빈 배열로 초기화
            setCategories([]);
            setUsedColors([]);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories(); // 모달이 열릴 때 카테고리 목록 가져오기
        }
    }, [isOpen]);

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
        
        // 카테고리 추가 옵션 선택 시
        if (name === "categoryId" && value === "add_new") {
            // 최신 카테고리 목록 조회
            fetchCategories().then(() => {
                // 조회 완료 후 사용 가능한 색상 확인
                const availableColor = findFirstAvailableColor();
                if (!availableColor) {
                    alert("모든 색상이 이미 사용 중입니다. 더 이상 카테고리를 추가할 수 없습니다.");
                    return;
                }
                
                // 새 카테고리 폼을 표시하면서 기본값 설정
                setNewCategory({
                    name: "",
                    color: availableColor // 사용 가능한 첫 번째 색상 설정
                });
                
                setShowCategoryForm(true);
                setIsCategoryAddMode(true);
            });
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleCategoryInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory(prev => ({
            ...prev,
            [name]: value
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

    // 색상이 사용 가능한지 확인하는 함수
    const isColorAvailable = (colorName) => {
        if (!colorName) return false;
        
        // 대소문자 통일을 위해 모두 대문자로 변환
        const normalizedColorName = colorName.toUpperCase();
        const normalizedUsedColors = usedColors.map(color => color.toUpperCase());
        
        return !normalizedUsedColors.includes(normalizedColorName);
    };
    
    // 사용 중인 색상에 해당하는 카테고리 찾기
    const findCategoryByColor = (colorName) => {
        if (!colorName) return null;
        
        // 대소문자 통일을 위해 모두 대문자로 변환
        const normalizedColorName = colorName.toUpperCase();
        
        return categories.find(cat => 
            cat.color && cat.color.toUpperCase() === normalizedColorName
        );
    };

    // 사용 가능한 첫 번째 색상 찾기
    const findFirstAvailableColor = () => {
        for (const color of Object.keys(categoryColorMap)) {
            if (isColorAvailable(color)) {
                return color;
            }
        }
        return null; // 모든 색상이 사용 중인 경우
    };

    // 카테고리 추가 또는 수정 함수
    const addCategory = async () => {
        try {
            if (!newCategory.name.trim()) {
                alert('카테고리 이름을 입력해주세요.');
                return;
            }

            if (!newCategory.color) {
                alert('카테고리 색상을 선택해주세요.');
                return;
            }


            // 선택한 색상을 사용중인 기존 카테고리 찾기
            const existingCategory = findCategoryByColor(newCategory.color);

            // 기본 요청 데이터
            const requestDto = {
                name: newCategory.name.trim(),
                color: newCategory.color,
                categoryType: "SCHEDULE"
            };
            
            let response;
            
            // 이미 사용 중인 색상을 선택한 경우 (수정)
            if (existingCategory) {
                // 수정 요청 데이터에 카테고리 ID 추가
                const patchDto = {
                    categoryId: existingCategory.id,
                    ...requestDto
                };
                
                // 수정 API 호출
                response = await api.patch('/api/v1/categories', patchDto);
                
                if (response.status === 200 && response.data.data) {
                    const updatedCategoryData = response.data.data;
                    
                    // 카테고리 목록에서 수정된 카테고리 업데이트
                    setCategories(prev => prev.map(cat => 
                        cat.id === updatedCategoryData.id 
                            ? { ...updatedCategoryData } 
                            : cat
                    ));
                    
                    // 사용 중인 색상 목록 업데이트
                    fetchCategories(); // 전체 카테고리를 다시 가져와 최신 상태 유지
                    
                    // 현재 선택된 카테고리를 수정된 카테고리로 변경
                    setFormData(prev => ({
                        ...prev,
                        categoryId: updatedCategoryData.id
                    }));
                    
                    // 카테고리 폼 초기화 및 닫기
                    resetCategoryForm();
                }
            } 
            // 새 카테고리 생성 (새로운 색상 사용)
            else {
                // 생성 API 호출
                response = await api.post('/api/v1/categories', requestDto);
                
                if (response.status === 200 && response.data.data) {
                    const newCategoryData = response.data.data;
                    
                    // 카테고리 목록에 새 카테고리 추가
                    setCategories(prev => [...prev, {
                        id: newCategoryData.id,
                        name: newCategoryData.name,
                        color: newCategoryData.color
                    }]);
                    
                    // 사용 중인 색상 목록 업데이트
                    setUsedColors(prev => [...prev, newCategoryData.color]);
                    
                    // 현재 선택된 카테고리를 새로 추가한 카테고리로 변경
                    setFormData(prev => ({
                        ...prev,
                        categoryId: newCategoryData.id
                    }));
                    
                    // 카테고리 폼 초기화 및 닫기
                    resetCategoryForm();
                }
            }
        } catch (error) {
            console.error('카테고리 저장 실패:', error);
            alert('카테고리 저장에 실패했습니다.');
        }
    };
    
    // 카테고리 폼 초기화 및 닫기
    const resetCategoryForm = () => {
        setShowCategoryForm(false);
        setNewCategory({ name: "", color: "" });
        setIsCategoryAddMode(true); // 추가 모드로 초기화
        
        // 카테고리 목록에서 전체 색상 목록 다시 계산
        const colors = categories.map(cat => cat.color);
        setUsedColors(colors);
    };

    // 카테고리 색상 가져오기
    const getCategoryColorHex = (colorName) => {
        return categoryColorMap[colorName]?.hex || "#A3B29F";
    };

    // 카테고리 삭제 함수
    const deleteCategory = async (categoryId) => {
        try {
            if (!categoryId) return;
            
            // 사용자 확인
            if (!confirm("정말 이 카테고리를 삭제하시겠습니까?")) {
                return;
            }
            
            const response = await api.delete(`/api/v1/categories?categoryId=${categoryId}`);
            
            if (response.status === 200) {
                // 카테고리 목록에서 삭제된 카테고리 제거
                setCategories(prev => prev.filter(cat => cat.id !== categoryId));
                
                // 사용 중인 색상 목록 업데이트
                fetchCategories();
                
                // 삭제된 카테고리가 현재 선택된 카테고리인 경우 첫 번째 카테고리로 변경
                if (formData.categoryId === categoryId && categories.length > 1) {
                    const remainingCategories = categories.filter(cat => cat.id !== categoryId);
                    if (remainingCategories.length > 0) {
                        setFormData(prev => ({
                            ...prev,
                            categoryId: remainingCategories[0].id
                        }));
                    }
                }
                
                // 카테고리 폼 초기화 및 닫기
                resetCategoryForm();
            }
        } catch (error) {
            console.error('카테고리 삭제 실패:', error);
            alert('카테고리 삭제에 실패했습니다.');
        }
    };

    if (!isOpen) return null;

    // 모든 색상 사용 가능 여부 확인
    const hasAvailableColors = Object.keys(categoryColorMap).some(color => isColorAvailable(color));

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
                        {!showCategoryForm ? (
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-[#E6EDE4] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-point"
                            >
                                {categories.length > 0 ? (
                                    <>
                                        {categories.map(category => {
                                            const colorHex = getCategoryColorHex(category.color);
                                            return (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            );
                                        })}
                                        {hasAvailableColors && <option value="add_new">+ 새 카테고리 추가</option>}
                                    </>
                                ) : (
                                    <>
                                        <option value="" disabled>카테고리가 없습니다</option>
                                        <option value="add_new">+ 카테고리 추가</option>
                                    </>
                                )}
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
                                        <p className="mt-1 text-[12px] text-subpoint">
                                            현재 "{findCategoryByColor(newCategory.color)?.name}" 카테고리에서 사용 중인 색상입니다.
                                        </p>
                                    )}
                                </div>
                                
                                <div className="mb-3">
                                    <label className="block text-[13px] font-medium text-textmain mb-1">색상 선택</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {categoryColors.map((color) => (
                                            <button
                                                key={color.colorName}
                                                type="button"
                                                className={`flex items-center py-1 px-2 rounded-md 
                                                    ${newCategory.color === color.colorName 
                                                        ? 'ring-2 ring-point bg-[#F0F5ED]' 
                                                        : !isColorAvailable(color.colorName)
                                                            ? 'bg-white hover:bg-[#F9FBF8] opacity-50' 
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
                                            onClick={addCategory}
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
                                                onClick={() => {
                                                    const categoryToDelete = findCategoryByColor(newCategory.color);
                                                    if (categoryToDelete) {
                                                        deleteCategory(categoryToDelete.id);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-[#FFEBEB] text-[#E07474] hover:bg-[#FFE0E0] hover:text-[#D05A5A] rounded-[6px] text-[13px] font-medium"
                                            >
                                                삭제
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={addCategory}
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
                            <div className="grid grid-cols-1 gap-4">
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
