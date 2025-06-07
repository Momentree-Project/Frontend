import { useState, useEffect, useRef } from 'react';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const eventSourceRef = useRef(null);

    // SSE 연결 설정
    useEffect(() => {
        const connectSSE = () => {
            try {
                // SSE 연결 생성
                const backendUrl = import.meta.env.VITE_CORE_API_BASE_URL;
                
                // 인증이 permitAll()로 설정되어 있으므로 withCredentials 불필요
                const eventSource = new EventSource(`${backendUrl}/api/v1/notifications`);
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
        setUnreadCount(prev => prev + 1);
    };

    // 알림 읽음 처리
    const markAsRead = (notificationId) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    // 모든 알림 읽음 처리
    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    // 알림 삭제
    const removeNotification = (notificationId) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === notificationId);
            if (notification && !notification.read) {
                setUnreadCount(count => Math.max(0, count - 1));
            }
            return prev.filter(n => n.id !== notificationId);
        });
    };

    // 모든 알림 삭제
    const clearAllNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        isConnected,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications
    };
}; 