import React, { useState } from 'react';
import { usePost } from './hooks/usePost';

function Post() {
    const [isWriting, setIsWriting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState('');
    const [selectedPost, setSelectedPost] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [likedPosts, setLikedPosts] = useState({});
    const { posts, loading, error, createPost, deletePost, updatePost, currentUserId } = usePost();

    // 로그인한 사용자 정보 가져오기
    const loginUserInfo = JSON.parse(localStorage.getItem('loginUserInfo') || '{}');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        const success = await createPost({ content });
        if (success) {
            setContent('');
            setIsWriting(false);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        const success = await updatePost(selectedPost.postId, { content });
        if (success) {
            setContent('');
            setIsEditing(false);
            setSelectedPost(null);
        }
    };

    const handleDelete = async (postId) => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            const success = await deletePost(postId);
            if (success) {
                setIsMenuOpen(false);
            }
        }
    };

    const handleMenuClick = (post, e) => {
        e.stopPropagation();
        setSelectedPost(post);
        setIsMenuOpen(true);
    };

    const handleEditClick = () => {
        setIsMenuOpen(false);
        setIsEditing(true);
        setContent(selectedPost.content);
    };

    const handleLike = (postId) => {
        setLikedPosts(prev => {
            const newState = { ...prev };
            newState[postId] = !prev[postId];
            return newState;
        });
    };

    // 시간 포맷팅 함수
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
        
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) return <div className="text-center py-5 text-lg text-gray-600">로딩 중...</div>;
    if (error) return <div className="text-center py-5 text-lg text-red-500">{error}</div>;

    return (
        <div className="bg-mainbg min-h-screen font-noto">
            <div className="flex flex-col w-full max-w-[420px] mx-auto">
                {/* 헤더 */}
                <div className="sticky top-0 z-10 bg-white shadow border-b border-gray-100 px-4 py-3 flex justify-between items-center">
                    <h1 className="text-[18px] font-semibold text-point">Momentree</h1>
                    {!isWriting && (
                        <button
                            onClick={() => setIsWriting(true)}
                            className="bg-point hover:bg-point/90 text-white px-4 py-2 rounded-[8px] text-[14px] font-medium transition-colors"
                        >
                            새 글 작성
                        </button>
                    )}
                </div>

                {/* 게시글 수정 폼 */}
                {isEditing && (
                    <div className="fixed inset-0 z-20 bg-black/50 flex items-center justify-center">
                        <div className="bg-white w-full max-w-[420px] rounded-t-[20px] p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-[16px] font-semibold">게시글 수정</h2>
                                <button 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setSelectedPost(null);
                                        setContent('');
                                    }}
                                    className="text-gray-500"
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={handleEdit}>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="무슨 생각을 하고 계신가요?"
                                    required
                                    className="w-full min-h-[120px] p-3 border border-gray-200 rounded-[12px] resize-y mb-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-point/20"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        type="submit"
                                        className="bg-point text-white rounded-[8px] px-4 py-2 text-[14px] font-medium"
                                    >
                                        수정하기
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 게시글 작성 폼 */}
                {isWriting && (
                    <div className="fixed inset-0 z-20 bg-black/50 flex items-center justify-center">
                        <div className="bg-white w-full max-w-[420px] rounded-t-[20px] p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-[16px] font-semibold">새 글 작성</h2>
                                <button 
                                    onClick={() => setIsWriting(false)}
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
                                <div className="flex justify-end">
                                    <button 
                                        type="submit"
                                        className="bg-point text-white rounded-[8px] px-4 py-2 text-[14px] font-medium"
                                    >
                                        게시하기
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* 게시글 메뉴 모달 */}
                {isMenuOpen && selectedPost && (
                    <div 
                        className="fixed inset-0 z-30 bg-black/50 flex items-end justify-center"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <div 
                            className="bg-white w-full max-w-[420px] rounded-t-[20px] p-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-[16px] font-semibold">게시글 메뉴</h2>
                                <button 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="text-gray-500"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-2">
                                {selectedPost?.userId?.userId === selectedPost?.loginUserId && (
                                    <>
                                        <button 
                                            onClick={handleEditClick}
                                            className="w-full text-left px-4 py-3 text-[14px] text-gray-700 hover:bg-gray-50 rounded-lg"
                                        >
                                            수정하기
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(selectedPost.postId)}
                                            className="w-full text-left px-4 py-3 text-[14px] text-red-500 hover:bg-gray-50 rounded-lg"
                                        >
                                            삭제하기
                                        </button>
                                    </>
                                )}
                                <button 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="w-full text-left px-4 py-3 text-[14px] text-gray-700 hover:bg-gray-50 rounded-lg"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* 게시글 목록 */}
                <div className="flex-1 px-2 pt-2 pb-6">
                    {posts.map((post) => {
                        const isMyPost = post.userId?.userId === post.loginUserId;
                        
                        return (
                            <article 
                                key={post.postId} 
                                className="bg-white rounded-[16px] shadow-sm mb-4 border border-gray-100"
                            >
                                {/* 게시글 헤더 */}
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-point/10 relative">
                                        <span className="font-medium text-point">
                                            {post.userId?.userName?.[0] || 'U'}
                                        </span>
                                        {!isMyPost && (
                                            <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] shadow">
                                                <svg 
                                                    xmlns="http://www.w3.org/2000/svg" 
                                                    className="h-3 w-3 text-red-500" 
                                                    viewBox="0 0 20 20" 
                                                    fill="currentColor"
                                                >
                                                    <path 
                                                        fillRule="evenodd" 
                                                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
                                                        clipRule="evenodd" 
                                                    />
                                                </svg>
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-[14px] text-gray-800">
                                                {post.userId?.userName || '사용자'}
                                            </span>
                                        </div>
                                        <div className="text-[12px] text-gray-500">
                                            {post.updatedAt && post.createdAt !== post.updatedAt 
                                                ? `${formatTime(post.updatedAt)} (수정)`
                                                : formatTime(post.createdAt)
                                            }
                                        </div>
                                    </div>
                                    {isMyPost && (
                                        <button 
                                            onClick={(e) => handleMenuClick(post, e)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            •••
                                        </button>
                                    )}
                                </div>

                                {/* 게시글 내용 */}
                                <div className="px-4 pb-3">
                                    <p className="text-[14px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </p>
                                </div>

                                {/* 게시글 액션 */}
                                <div className="px-4 pb-4 flex items-center gap-4">
                                    <button 
                                        onClick={() => handleLike(post.postId)}
                                        className={`flex items-center gap-1 transition-colors ${
                                            likedPosts[post.postId] ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                        }`}
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-5 w-5 transition-all hover:scale-110" 
                                            fill={likedPosts[post.postId] ? 'currentColor' : 'none'}
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                                            />
                                        </svg>
                                        <span className="text-[13px]">{likedPosts[post.postId] ? 1 : 0}</span>
                                    </button>
                                    <button className="flex items-center gap-1 text-gray-500">
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            className="h-5 w-5" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                                            />
                                        </svg>
                                        <span className="text-[13px]">0</span>
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Post; 