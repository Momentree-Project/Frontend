import React from 'react';

const ImageViewerModal = ({ 
    isOpen, 
    onClose, 
    images, 
    currentIndex = 0
}) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(currentIndex);
    
    // 초기 인덱스 설정
    React.useEffect(() => {
        setCurrentImageIndex(currentIndex);
    }, [currentIndex, images]);
    
    if (!isOpen) return null;
    
    // 이전 이미지 보기
    const showPreviousImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => 
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    // 다음 이미지 보기
    const showNextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => 
            prev === images.length - 1 ? 0 : prev + 1
        );
    };
    
    return (
        <div 
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={onClose}
        >
            <div 
                className="relative w-full h-full flex flex-col justify-center items-center"
                onClick={e => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button 
                    className="absolute top-4 right-4 text-white p-2 z-50"
                    onClick={onClose}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* 이미지 카운터 */}
                <div className="absolute top-4 left-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {images.length}
                </div>
                
                {/* 이미지 영역 */}
                <div className="w-full h-full flex items-center justify-center p-4">
                    <img 
                        src={images[currentImageIndex]} 
                        alt={`이미지 ${currentImageIndex + 1}`}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
                
                {/* 이전 이미지 버튼 */}
                {images.length > 1 && (
                    <button 
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
                        onClick={showPreviousImage}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}
                
                {/* 다음 이미지 버튼 */}
                {images.length > 1 && (
                    <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
                        onClick={showNextImage}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
                
                {/* 미니 썸네일 갤러리 */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center overflow-x-auto py-2 px-4">
                        <div className="flex gap-2">
                            {images.map((url, idx) => (
                                <div
                                    key={idx}
                                    className={`w-12 h-12 rounded-md overflow-hidden cursor-pointer border-2 ${
                                        currentImageIndex === idx ? 'border-white' : 'border-transparent'
                                    }`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(idx);
                                    }}
                                >
                                    <img
                                        src={url}
                                        alt={`썸네일 ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageViewerModal; 