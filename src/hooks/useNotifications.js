import { useState, useEffect, useRef } from 'react';
import api from '../api/axiosInstance';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [latestNotification, setLatestNotification] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const eventSourceRef = useRef(null);

    // 최신 알림 조회
    const fetchLatestNotification = async () => {
        try {
            const response = await api.get('/api/v1/notifications/latest');
            if (response.data.code === 200) {
                setLatestNotification(response.data.data);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                setLatestNotification(null);
            } else {
                console.error('📋 최신 알림 조회 실패:', error);
            }
        }
    };

    // 전체 알림 조회 (페이징)
    const fetchAllNotifications = async (page = 0, append = false) => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const response = await api.get(`/api/v1/notifications?page=${page}&size=5`);
            if (response.data.code === 200) {
                const pageData = response.data.data;
                
                if (append && page > 0) {
                    // 추가 로드 (더보기)
                    setNotifications(prev => [...prev, ...pageData.content]);
                } else {
                    // 첫 로드
                    setNotifications(pageData.content);
                }
                
                setCurrentPage(page);
                setHasMore(!pageData.last);
            }
        } catch (error) {
            console.error('📋 전체 알림 조회 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 더 많은 알림 로드
    const loadMoreNotifications = () => {
        if (hasMore && !isLoading) {
            fetchAllNotifications(currentPage + 1, true);
        }
    };

    // 알림 읽음 처리
    const markNotificationAsRead = async (notificationId) => {
        try {
            const response = await api.patch(`/api/v1/notifications/${notificationId}`);
            if (response.data.code === 200) {
                
                // 로컬 상태 업데이트
                setNotifications(prev => 
                    prev.map(notification => 
                        notification.id === notificationId 
                            ? { ...notification, isRead: true }
                            : notification
                    )
                );
                
                // 최신 알림도 업데이트
                if (latestNotification && latestNotification.id === notificationId) {
                    setLatestNotification(prev => ({ ...prev, isRead: true }));
                }
            }
        } catch (error) {
            console.error('📖 알림 읽음 처리 실패:', error);
        }
    };

    // 모든 알림 읽음 처리
    const markAllNotificationsAsRead = async () => {
        try {
            const response = await api.patch('/api/v1/notifications?page=0&size=5');
            if (response.data.code === 200) {
                
                // 로컬 상태 업데이트 - 모든 알림을 읽음 상태로 변경
                setNotifications(prev => 
                    prev.map(notification => ({ ...notification, isRead: true }))
                );
                
                // 최신 알림도 읽음 상태로 업데이트
                if (latestNotification) {
                    setLatestNotification(prev => ({ ...prev, isRead: true }));
                }
                
                // 전체 알림 목록 새로고침
                fetchAllNotifications(0, false);
            }
        } catch (error) {
            console.error('📖 모든 알림 읽음 처리 실패:', error);
        }
    };

    // SSE 연결 설정
    useEffect(() => {
        const connectSSE = () => {
            try {
                // SSE 연결 생성
                const backendUrl = import.meta.env.VITE_CORE_API_BASE_URL;
                
                // 인증이 permitAll()로 설정되어 있으므로 withCredentials 불필요
                const eventSource = new EventSource(`${backendUrl}/api/v1/notifications/connects`);
                eventSourceRef.current = eventSource;

                // 연결 성공 이벤트 처리
                eventSource.addEventListener('connect', (event) => {
                    setIsConnected(true);
                });

                // 새로운 알림 이벤트 처리
                eventSource.addEventListener('newNotification', (event) => {
                    const data = JSON.parse(event.data);
                    addNotification(data);
                });

                // 일정 관련 알림 이벤트들
                eventSource.addEventListener('scheduleCreated', (event) => {
                    addNotification({
                        id: Date.now(),
                        type: 'schedule',
                        title: '새 일정이 추가되었습니다',
                        message: '새로운 일정이 생성되었습니다.',
                        timestamp: new Date(),
                        read: false
                    });
                });

                eventSource.addEventListener('scheduleUpdated', (event) => {
                    addNotification({
                        id: Date.now(),
                        type: 'schedule',
                        title: '일정이 수정되었습니다',
                        message: '일정 정보가 업데이트되었습니다.',
                        timestamp: new Date(),
                        read: false
                    });
                });

                // 연결 오류 처리
                eventSource.onerror = (error) => {
                    setIsConnected(false);
                    
                    // 5초 후 재연결 시도
                    setTimeout(() => {
                        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
                            connectSSE();
                        }
                    }, 5000);
                };

            } catch (error) {
                setIsConnected(false);
            }
        };

        connectSSE();
        fetchLatestNotification(); // 초기 최신 알림 조회

        // 컴포넌트 언마운트 시 연결 해제
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, []);

    // 새 알림 추가
    const addNotification = (notification) => {
        setNotifications(prev => [notification, ...prev]);
    };



    return {
        notifications,
        latestNotification,
        isConnected,
        currentPage,
        hasMore,
        isLoading,
        fetchLatestNotification,
        fetchAllNotifications,
        loadMoreNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead
    };
}; 