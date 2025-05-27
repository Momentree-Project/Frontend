import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosInstance';

export function usePost() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [userLikes, setUserLikes] = useState({});

    // 게시글 목록 조회
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/v1/posts');
            const postsData = response.data.data || [];
            
            // 서버에서 받은 데이터에는 이미 imageUrls와 imageIds가 포함되어 있음
            setPosts(postsData);
            
            // 각 게시글에 대한 사용자의 좋아요 상태 조회
            const likesStatus = {};
            for (const post of postsData) {
                try {
                    const likeResponse = await api.get(`/api/v1/posts/${post.postId}/likes`);
                    if (likeResponse.status === 200) {
                        const likeData = likeResponse.data.data;
                        likesStatus[post.postId] = {
                            isLiked: likeData.isLikedByCurrentUser,
                            likesCount: likeData.likesCount
                        };
                    }
                } catch (error) {
                    // 개별 좋아요 조회 실패는 무시
                    console.warn(`Failed to fetch likes for post ${post.postId}`);
                }
            }
            setUserLikes(likesStatus);
            
            setError(null);
        } catch (error) {
            setError('게시글을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // 게시글 작성
    const createPost = async (postData) => {
        try {
            const formData = new FormData();
            formData.append('content', postData.content);
            formData.append('fileType', 'POST');
            
            if (postData.images && postData.images.length > 0) {
                postData.images.forEach(image => {
                    formData.append('images', image);
                });
            }
            
            const response = await api.post('/api/v1/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            if (response.status === 200) {
                setRefreshTrigger(prev => prev + 1);
                return true;
            }
            return false;
        } catch (error) {
            setError('게시글 작성에 실패했습니다.');
            return false;
        }
    };

    // 게시글 삭제
    const deletePost = async (postId) => {
        try {
            const response = await api.delete(`/api/v1/posts/${postId}`);
            if (response.status === 200) {
                setRefreshTrigger(prev => prev + 1);
                return true;
            }
            return false;
        } catch (error) {
            setError('게시글 삭제에 실패했습니다.');
            return false;
        }
    };

    // 게시글 좋아요
    const likePost = async (postId) => {
        try {
            // 좋아요 토글 API 호출
            const likeResponse = await api.patch(`/api/v1/posts/${postId}/likes`);
            
            if (likeResponse.status === 200) {
                // 좋아요 수 조회 API 호출
                const countResponse = await api.get(`/api/v1/posts/${postId}/likes`);
                
                if (countResponse.status === 200) {
                    const likeData = countResponse.data.data;
                    
                    // 게시글 목록에서 해당 게시글의 좋아요 수 업데이트
                    setPosts(prevPosts => 
                        prevPosts.map(post => 
                            post.postId === postId 
                                ? {
                                    ...post,
                                    likesCount: likeData.likesCount
                                }
                                : post
                        )
                    );
                    
                    // 사용자 좋아요 상태 업데이트
                    setUserLikes(prev => ({
                        ...prev,
                        [postId]: {
                            isLiked: likeData.isLikedByCurrentUser,
                            likesCount: likeData.likesCount
                        }
                    }));
                    
                    return true;
                }
            }
            return false;
        } catch (error) {
            setError('좋아요 처리에 실패했습니다.');
            return false;
        }
    };

    // 게시글 수정
    const updatePost = async (postId, postData) => {
        try {
            const formData = new FormData();
            formData.append('postId', postId);
            formData.append('content', postData.content);
            formData.append('fileType', 'POST');
            
            if (postData.images && postData.images.length > 0) {
                postData.images.forEach(image => {
                    formData.append('images', image);
                });
            }
            
            if (postData.deleteImageIds && postData.deleteImageIds.length > 0) {
                postData.deleteImageIds.forEach(imageId => {
                    formData.append('deleteImageIds', imageId);
                });
            }
            
            const response = await api.patch('/api/v1/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            if (response.status === 200) {
                setRefreshTrigger(prev => prev + 1);
                return true;
            }
            return false;
        } catch (error) {
            setError('게시글 수정에 실패했습니다.');
            return false;
        }
    };

    // 댓글 작성
    const createComment = async (commentData) => {
        try {
            const response = await api.post('/api/v1/posts/comments', commentData);
            if (response.status === 200) {
                setRefreshTrigger(prev => prev + 1);
                return response.data;
            }
            return null;
        } catch (error) {
            setError('댓글 작성에 실패했습니다.');
            throw error;
        }
    };

    // 댓글 조회
    const getComments = async (postId) => {
        try {
            const response = await api.get(`/api/v1/posts/comments/${postId}`);
            if (response.status === 200) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            setError('댓글을 불러오는데 실패했습니다.');
            throw error;
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, refreshTrigger]);

    return {
        posts,
        loading,
        error,
        userLikes,
        createPost,
        deletePost,
        updatePost,
        likePost,
        createComment,
        getComments
    };
} 