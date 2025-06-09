import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePost } from './hooks/usePost';
import api from '../../api/axiosInstance';

// 모달 컴포넌트 import
import ImageViewerModal from './components/ImageViewerModal';
import PostMenuModal from './components/PostMenuModal';
import EditPostModal from './components/EditPostModal';
import CreatePostModal from './components/CreatePostModal';
import CommentForm from '../../components/CommentForm';
import CommentList from '../../components/CommentList';
import { Layout } from '../../components/Layout';

function Post() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isWriting, setIsWriting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [highlightPostId, setHighlightPostId] = useState(null);
    
    // 이미지 뷰어 관련 상태
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [viewerImageUrls, setViewerImageUrls] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    
    // 댓글 관련 상태
    const [showComments, setShowComments] = useState({});
    const [comments, setComments] = useState({});
    // 답글 모드 상태 추가
    const [replyMode, setReplyMode] = useState(null); // { postId, parentId, parentAuthor, level }
    
    const { posts, loading, error, userLikes, createPost, deletePost, updatePost, likePost, createComment, getComments, modifiedPosts } = usePost();

    // 로그인한 사용자 정보 가져오기
    const loginUserInfo = JSON.parse(localStorage.getItem('loginUserInfo') || '{}');

    // URL 파라미터로 전달된 게시글 하이라이트 처리
    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        const openComments = searchParams.get('openComments');
        
        if (highlightId && posts.length > 0) {
            setHighlightPostId(parseInt(highlightId));
            
            // 댓글창 자동 열기가 요청된 경우
            if (openComments === 'true') {
                const postId = parseInt(highlightId);
                setShowComments(prev => ({
                    ...prev,
                    [postId]: true
                }));
                
                // 댓글이 아직 로드되지 않았다면 로드
                if (!comments[postId]) {
                    getComments(postId).then(commentsData => {
                        setComments(prev => ({
                            ...prev,
                            [postId]: commentsData
                        }));
                    }).catch(error => {
                        console.error('댓글 불러오기 실패:', error);
                    });
                }
            }
            
            // 해당 게시글로 스크롤
            setTimeout(() => {
                const element = document.getElementById(`post-${highlightId}`);
                if (element) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    
                    // URL에서 파라미터 제거
                    setSearchParams(new URLSearchParams());
                    
                    // 3초 후 하이라이트 제거
                    setTimeout(() => {
                        setHighlightPostId(null);
                    }, 3000);
                }
            }, 500);
        }
    }, [posts, searchParams, setSearchParams]);

    const handleCreatePost = (postData) => {
        createPost(postData).then(success => {
            if (success) {
                setIsWriting(false);
            }
        });
    };

    const handleUpdatePost = (postId, postData) => {
        updatePost(postId, postData).then(success => {
            if (success) {
                setIsEditing(false);
                setSelectedPost(null);
            }
        });
    };

    const handleDelete = async (postId) => {
        if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
            const success = await deletePost(postId);
            if (success) {
                setIsMenuOpen(false);
                setSelectedPost(null);
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
    };

    const handleLike = (postId) => {
        likePost(postId);
    };

    // 댓글 토글
    const toggleComments = async (postId) => {
        const newShowComments = !showComments[postId];
        setShowComments(prev => ({
            ...prev,
            [postId]: newShowComments
        }));

        // 댓글 섹션이 열릴 때만 댓글을 불러옴
        if (newShowComments && !comments[postId]) {
            try {
                const commentsData = await getComments(postId);
                setComments(prev => ({
                    ...prev,
                    [postId]: commentsData
                }));
            } catch (error) {
                console.error('댓글 불러오기 실패:', error);
            }
        }
    };

    // 댓글 추가
    const handleCommentSubmit = async (postId, newComment) => {
        try {
            await createComment(newComment);
            const updatedComments = await getComments(postId);
            setComments(prev => ({
                ...prev,
                [postId]: updatedComments
            }));
            setReplyMode(null); // 작성 후 항상 일반 모드로 복귀
        } catch (error) {
            console.error('댓글 작성 실패:', error);
        }
    };

    // 답글 모드 진입
    const handleReplyClick = (postId, parentId, parentAuthor) => {
        setReplyMode({ postId, parentId, parentAuthor, level: 1 });
    };
    // 답글 모드 취소
    const handleReplyCancel = () => {
        setReplyMode(null);
    };

    // 이미지 뷰어 열기
    const openImageViewer = (imageUrls, startIndex = 0) => {
        setViewerImageUrls(imageUrls);
        setCurrentImageIndex(startIndex);
        setIsImageViewerOpen(true);
    };
    
    // 이미지 뷰어 닫기
    const closeImageViewer = () => {
        setIsImageViewerOpen(false);
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

    // 댓글/답글 수정
    const handleEditComment = async (commentId, postId, newContent) => {
        try {
            const response = await api.patch(`/api/v1/posts/comments/${commentId}`, {
                content: newContent
            });
            
            // HTTP 상태는 200이지만 응답 데이터에 에러 코드가 있는 경우 처리
            if (response.data.code !== 200 && response.data.code !== 'SUCCESS') {
                alert(response.data.message || '댓글 수정에 실패했습니다.');
                return false;
            }
            
            const updatedComments = await getComments(postId);
            setComments(prev => ({
                ...prev,
                [postId]: updatedComments
            }));
            return true;
        } catch (error) {
            let errorMessage = '댓글 수정에 실패했습니다.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            alert(errorMessage);
            return false;
        }
    };

    // 댓글/답글 삭제
    const handleDeleteComment = async (commentId, postId) => {
        if (!window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) return;
        try {
            const response = await api.delete(`/api/v1/posts/comments/${commentId}`);
            
            // HTTP 상태는 200이지만 응답 데이터에 에러 코드가 있는 경우 처리
            if (response.data.code !== 200 && response.data.code !== 'SUCCESS') {
                alert(response.data.message || '댓글 삭제에 실패했습니다.');
                return;
            }
            
            const updatedComments = await getComments(postId);
            setComments(prev => ({
                ...prev,
                [postId]: updatedComments
            }));
        } catch (error) {
            let errorMessage = '댓글 삭제에 실패했습니다.';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            alert(errorMessage);
        }
    };

    if (loading) return <div className="text-center py-5 text-lg text-gray-600">로딩 중...</div>;
    if (error) return <div className="text-center py-5 text-lg text-red-500">{error}</div>;

    // 헤더 우측 새 글 작성 버튼
    const headerRightActions = (
        <>
            <button
                onClick={() => setIsWriting(true)}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-white bg-point hover:bg-point/90 rounded-lg transition-colors"
            >
                <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4" 
                    />
                </svg>
                <span>글쓰기</span>
            </button>
            <button
                onClick={() => {
                    // 로그아웃 기능은 나중에 구현
                    alert('로그아웃 기능은 아직 구현되지 않았습니다.');
                }}
                className="flex items-center justify-center w-10 h-10 text-point hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                    />
                </svg>
            </button>
        </>
    );

    return (
        <Layout headerRightActions={headerRightActions} customTopPadding="pt-16">
            <div className="bg-mainbg min-h-screen font-noto">
                <div className="flex flex-col w-full max-w-[420px] mx-auto">

                {/* 모달 컴포넌트들 */}
                <EditPostModal 
                    isOpen={isEditing}
                    onClose={() => {
                        setIsEditing(false);
                        setSelectedPost(null);
                    }}
                    post={selectedPost}
                    onEdit={handleUpdatePost}
                />

                <CreatePostModal 
                    isOpen={isWriting}
                    onClose={() => setIsWriting(false)}
                    onCreate={handleCreatePost}
                />

                <PostMenuModal
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    post={selectedPost}
                    onEdit={handleEditClick}
                    onDelete={() => selectedPost && handleDelete(selectedPost.postId)}
                />

                <ImageViewerModal 
                    isOpen={isImageViewerOpen}
                    onClose={closeImageViewer}
                    images={viewerImageUrls}
                    currentIndex={currentImageIndex}
                />



                {/* 게시글 목록 */}
                <div className="flex-1 px-2 pt-2 pb-6">
                    {posts.map((post) => {
                        const isMyPost = post.userId?.userId === post.loginUserId;
                        
                        return (
                            <article 
                                key={post.postId}
                                id={`post-${post.postId}`}
                                className={`bg-white rounded-[16px] shadow-sm mb-4 border transition-all duration-1000 ${
                                    highlightPostId === post.postId 
                                        ? 'border-point shadow-md ring-2 ring-point/20' 
                                        : 'border-gray-100'
                                }`}
                            >
                                {/* 게시글 헤더 */}
                                <div className="p-4 flex items-center gap-3">
                                    <div className="w-10 h-10 relative">
                                        <div className="w-full h-full rounded-full overflow-hidden">
                                            {post.userId?.profileImageUrl ? (
                                                <img 
                                                    src={post.userId.profileImageUrl} 
                                                    alt={`${post.userId.userName}의 프로필`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-point/10">
                                                    <span className="font-medium text-point">
                                                        {post.userId?.userName?.[0] || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
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
                                            {formatTime(post.createdAt)}
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

                                {/* 게시글 이미지 */}
                                {post.imageUrls && post.imageUrls.length > 0 && (
                                    <div className="px-4 pb-3">
                                        {post.imageUrls.length === 1 ? (
                                            <div 
                                                className="cursor-pointer" 
                                                onClick={() => openImageViewer(post.imageUrls, 0)}
                                            >
                                                <img 
                                                    src={post.imageUrls[0]} 
                                                    alt="게시글 이미지" 
                                                    className="w-full h-auto rounded-lg"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ) : (
                                            <div className={`grid ${getGridClass(Math.min(post.imageUrls.length, 4))} gap-2`}>
                                                {post.imageUrls.slice(0, 4).map((url, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="relative cursor-pointer"
                                                        onClick={() => openImageViewer(post.imageUrls, index)}
                                                    >
                                                        <img 
                                                            src={url} 
                                                            alt={`게시글 이미지 ${index + 1}`} 
                                                            className="w-full h-28 object-cover rounded-lg"
                                                            loading="lazy"
                                                        />
                                                        {post.imageUrls.length > 4 && index === 3 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                                                <span className="text-white font-medium">+{post.imageUrls.length - 4}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 게시글 액션 */}
                                <div className="px-4 pb-4 flex items-center gap-4">
                                    <button 
                                        onClick={() => handleLike(post.postId)}
                                        style={{ cursor: 'pointer' }}
                                        className={`flex items-center gap-1 transition-colors hover:opacity-75 ${
                                            userLikes[post.postId]?.isLiked 
                                                ? 'text-red-500' 
                                                : 'text-gray-500 hover:text-red-500'
                                        }`}
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            style={{ cursor: 'pointer' }}
                                            className="h-5 w-5 transition-all hover:scale-110" 
                                            fill={userLikes[post.postId]?.isLiked ? 'currentColor' : 'none'}
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
                                        <span className="text-[13px]">
                                            {userLikes[post.postId]?.likesCount || post.likesCount || 0}
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => toggleComments(post.postId)}
                                        style={{ cursor: 'pointer' }}
                                        className={`flex items-center gap-1 text-gray-500 hover:text-blue-500 transition-colors ${showComments[post.postId] ? 'text-blue-500' : ''}`}
                                    >
                                        <svg 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            style={{ cursor: 'pointer' }}
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
                                        <span className="text-[13px] font-medium">
                                            {comments[post.postId]
                                                ? comments[post.postId].length
                                                : post.commentCount ?? 0}
                                        </span>
                                    </button>
                                </div>

                                {/* 댓글 섹션 */}
                                {showComments[post.postId] && (
                                    <div className="px-4 pb-4 border-t border-gray-100">
                                        {/* 댓글 목록 */}
                                        <CommentList 
                                            comments={comments[post.postId] || []}
                                            onReplyClick={(parentId, parentAuthor) => handleReplyClick(post.postId, parentId, parentAuthor)}
                                            replyMode={replyMode}
                                            renderReplyForm={(parentId, parentAuthor) => (
                                                replyMode && replyMode.postId === post.postId && replyMode.parentId === parentId ? (
                                                    <CommentForm
                                                        postId={post.postId}
                                                        level={1}
                                                        parentId={parentId}
                                                        parentAuthor={parentAuthor}
                                                        onCommentSubmit={(newComment) => handleCommentSubmit(post.postId, newComment)}
                                                        onCancelReply={handleReplyCancel}
                                                        isReplyMode={true}
                                                    />
                                                ) : null
                                            )}
                                            onDeleteComment={(commentId) => handleDeleteComment(commentId, post.postId)}
                                            onEditComment={(commentId, newContent) => handleEditComment(commentId, post.postId, newContent)}
                                        />
                                        {/* 댓글/답글 작성 폼 (하단, 답글 모드 아닐 때만) */}
                                        {!(replyMode && replyMode.postId === post.postId) && (
                                            <CommentForm 
                                                postId={post.postId}
                                                level={0}
                                                parentId={null}
                                                parentAuthor={null}
                                                onCommentSubmit={(newComment) => handleCommentSubmit(post.postId, newComment)}
                                                onCancelReply={handleReplyCancel}
                                                isReplyMode={false}
                                            />
                                        )}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </div>


        </div>
        </Layout>
    );
}

export default Post; 