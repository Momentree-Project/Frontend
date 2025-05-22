import React, { useState, useEffect, useRef } from 'react';

const EditPostModal = ({ 
    isOpen, 
    onClose, 
    post, 
    onEdit
}) => {
    const [content, setContent] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]);
    const [deleteImageIds, setDeleteImageIds] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (isOpen && post) {
            setContent(post.content);
            
            // 기존 이미지가 있으면 설정
            if (post.imageUrls && post.imageUrls.length > 0) {
                // 서버에서 이미지 URL과 ID를 함께 제공함
                const images = post.imageUrls.map((url, index) => ({
                    id: post.imageIds && post.imageIds.length > index ? post.imageIds[index] : null,
                    url: url,
                    isExisting: true
                }));
                
                setExistingImages(images);
            } else {
                setExistingImages([]);
            }
            
            // 상태 초기화
            setSelectedImages([]);
            setImagePreviewUrls([]);
            setDeleteImageIds([]);
        }
    }, [isOpen, post]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        
        onEdit(post.postId, { 
            content,
            images: selectedImages,
            deleteImageIds: deleteImageIds
        });
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            // 최대 10장까지만 허용 (기존 + 새 이미지)
            const totalImages = existingImages.length - deleteImageIds.length + selectedImages.length + files.length;
            if (totalImages > 10) {
                alert("이미지는 최대 10장까지 업로드할 수 있습니다.");
                return;
            }
            
            // 기존 이미지와 합치기
            const newSelectedImages = [...selectedImages, ...files];
            setSelectedImages(newSelectedImages);
            
            // 각 파일의 미리보기 URL 생성
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviewUrls(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleRemoveNewImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
    };
    
    const handleToggleDeleteExistingImage = (image) => {
        // 이미지 ID가 없는 경우 처리
        if (image.id === null) {
            alert('이미지 ID가 유효하지 않아 삭제할 수 없습니다.');
            return;
        }
        
        if (deleteImageIds.includes(image.id)) {
            // 삭제 취소
            setDeleteImageIds(prev => prev.filter(id => id !== image.id));
        } else {
            // 삭제 표시
            setDeleteImageIds(prev => [...prev, image.id]);
        }
    };

    // 이미지 그리드 레이아웃 결정 함수
    const getGridClass = (count) => {
        switch(count) {
            case 1: return 'grid-cols-1';
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            default: return 'grid-cols-2';
        }
    };
    
    // 현재 표시 가능한 총 이미지 수 계산 (기존 이미지 중 삭제 안된 것 + 새 이미지)
    const totalDisplayableImages = existingImages.length - deleteImageIds.length + selectedImages.length;

    // 이미지 최대 개수
    const MAX_IMAGES = 10;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-20 bg-black/50 flex items-center justify-center">
            <div className="bg-white w-full max-w-[420px] rounded-t-[20px] p-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[16px] font-semibold">게시글 수정</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500"
                    >
                        ✕
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="무슨 생각을 하고 계신가요?"
                        required
                        className="w-full min-h-[120px] p-3 border border-gray-200 rounded-[12px] resize-y mb-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-point/20"
                    />
                    
                    {/* 기존 이미지 표시 영역 */}
                    {existingImages.length > 0 && (
                        <div className="mb-3">
                            <p className="text-[14px] font-medium mb-2 text-gray-700">기존 이미지</p>
                            <div className={`grid ${getGridClass(Math.min(existingImages.length, 3))} gap-2`}>
                                {existingImages.map((image, index) => (
                                    <div 
                                        key={index} 
                                        className={`relative rounded-lg overflow-hidden h-24 ${
                                            deleteImageIds.includes(image.id) ? 'opacity-50' : ''
                                        }`}
                                    >
                                        <img 
                                            src={image.url} 
                                            alt={`기존 이미지 ${index + 1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleToggleDeleteExistingImage(image)}
                                            className={`absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center ${
                                                deleteImageIds.includes(image.id) ? 'bg-gray-400' : 'bg-red-500'
                                            }`}
                                        >
                                            {deleteImageIds.includes(image.id) ? '↩' : '✕'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* 새로 추가한 이미지 미리보기 영역 */}
                    {imagePreviewUrls.length > 0 && (
                        <div className="mb-3">
                            <p className="text-[14px] font-medium mb-2 text-gray-700">새로 추가할 이미지</p>
                            <div className={`grid ${getGridClass(Math.min(imagePreviewUrls.length, 3))} gap-2`}>
                                {imagePreviewUrls.map((previewUrl, index) => (
                                    <div key={index} className="relative rounded-lg overflow-hidden h-24">
                                        <img 
                                            src={previewUrl} 
                                            alt={`이미지 미리보기 ${index + 1}`} 
                                            className="w-full h-full object-cover"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => handleRemoveNewImage(index)}
                                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="text-point flex items-center gap-1 text-[14px]"
                            disabled={totalDisplayableImages >= MAX_IMAGES}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                            </svg>
                            사진 추가 ({totalDisplayableImages}/{MAX_IMAGES})
                        </button>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageSelect} 
                            className="hidden"
                            multiple
                            disabled={totalDisplayableImages >= MAX_IMAGES}
                        />
                        <button 
                            type="submit"
                            className="bg-point text-white rounded-[8px] px-4 py-2 text-[14px] font-medium"
                        >
                            수정하기
                        </button>
                    </div>
                    {totalDisplayableImages >= MAX_IMAGES && (
                        <p className="text-red-500 text-xs mt-1">
                            최대 10장까지 업로드할 수 있습니다.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EditPostModal; 