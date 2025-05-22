import React from 'react';

const PostMenuModal = ({ 
    isOpen, 
    onClose, 
    post, 
    onEdit, 
    onDelete 
}) => {
    if (!isOpen) return null;
    
    const isMyPost = post?.userId?.userId === post?.loginUserId;
    
    return (
        <div 
            className="fixed inset-0 z-30 bg-black/50 flex items-end justify-center"
            onClick={onClose}
        >
            <div 
                className="bg-white w-full max-w-[420px] rounded-t-[20px] p-4"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[16px] font-semibold">게시글 메뉴</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500"
                    >
                        ✕
                    </button>
                </div>
                <div className="space-y-2">
                    {isMyPost && (
                        <>
                            <button 
                                onClick={onEdit}
                                className="w-full text-left px-4 py-3 text-[14px] text-gray-700 hover:bg-gray-50 rounded-lg"
                            >
                                수정하기
                            </button>
                            <button 
                                onClick={onDelete}
                                className="w-full text-left px-4 py-3 text-[14px] text-red-500 hover:bg-gray-50 rounded-lg"
                            >
                                삭제하기
                            </button>
                        </>
                    )}
                    <button 
                        onClick={onClose}
                        className="w-full text-left px-4 py-3 text-[14px] text-gray-700 hover:bg-gray-50 rounded-lg"
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostMenuModal; 