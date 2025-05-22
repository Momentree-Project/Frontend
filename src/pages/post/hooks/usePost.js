import { useState, useEffect, useCallback } from 'react';
import api from '../../../api/axiosInstance';

export function usePost() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 게시글 목록 조회
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/v1/posts');
            const postsData = response.data.data || [];
            
            // 서버에서 받은 데이터에는 이미 imageUrls와 imageIds가 포함되어 있음
            setPosts(postsData);
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
            const response = await api.post(`/api/v1/posts/${postId}/like`);
            if (response.status === 200) {
                // 좋아요 상태 업데이트
                setPosts(prevPosts => 
                    prevPosts.map(post => 
                        post.id === postId 
                            ? {
                                ...post,
                                isLiked: !post.isLiked,
                                likeCount: post.isLiked ? post.likeCount - 1 : post.likeCount + 1
                            }
                            : post
                    )
                );
                return true;
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
            
            // 새 이미지가 있으면 추가
            if (postData.images && postData.images.length > 0) {
                postData.images.forEach(image => {
                    formData.append('images', image);
                });
            }
            
            // 삭제할 이미지 ID가 있으면 추가
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

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, refreshTrigger]);

    return {
        posts,
        loading,
        error,
        createPost,
        deletePost,
        updatePost,
        likePost
    };
} 