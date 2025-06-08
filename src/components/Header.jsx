import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import logo from '../assets/images/logo.png';

const Header = ({ rightActions }) => {
    const {
        notifications,
        latestNotification,
        hasMore,
        isLoading,
        fetchAllNotifications,
        loadMoreNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead
    } = useNotifications();

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef(null);

    // 알림 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 알림 드롭다운 토글
    const toggleNotification = () => {
        const newState = !isNotificationOpen;
        setIsNotificationOpen(newState);
        
        // 드롭다운이 열릴 때 전체 알림 조회
        if (newState) {
            fetchAllNotifications(0, false);
        }
    };

    // 시간 포맷팅 함수
    const formatTime = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        if (diff < 60000) return '방금 전';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
        return time.toLocaleDateString();
    };

    return (
        <div className="fixed top-0 left-0 right-0 flex justify-center z-10">
            <header className="w-full max-w-[600px] bg-white border-b border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* 로고 */}
                        <div className="flex items-center">
                            <img 
                                src={logo} 
                                alt="Momentree" 
                                className="h-8"
                            />
                        </div>

                        {/* 가운데 알림 영역 */}
                        <div className="flex-1 mx-2 min-w-0 relative" ref={notificationRef}>
                            <button
                                onClick={toggleNotification}
                                className="flex items-center justify-center w-full px-3 py-2 rounded-lg transition-colors relative hover:bg-gray-50"
                            >
                                {latestNotification ? (
                                    <div className="flex items-center space-x-2 w-full">
                                        <div className="flex-shrink-0">
                                            <div className={`w-2 h-2 rounded-full ${
                                                !latestNotification.isRead ? 'bg-point' : 'bg-gray-300'
                                            }`}></div>
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <div className={`text-sm truncate ${
                                                !latestNotification.isRead ? 'text-gray-900 font-medium' : 'text-gray-700'
                                            }`}>
                                                {latestNotification.content}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 text-gray-400">
                                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                        <span className="text-sm">알림이 없습니다</span>
                                    </div>
                                )}
                            </button>

                            {/* 알림 드롭다운 */}
                            {isNotificationOpen && (
                                <div className="fixed left-1/2 transform -translate-x-1/2 top-16 w-[90vw] max-w-md bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-[100]">
                                    {/* 드롭다운 헤더 */}
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">알림</h3>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={markAllNotificationsAsRead}
                                                className="text-sm text-point hover:text-point/80"
                                            >
                                                모두 읽음
                                            </button>
                                        </div>
                                    </div>

                                    {/* 알림 목록 */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {isLoading && notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-500">
                                                로딩 중...
                                            </div>
                                        ) : notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-500">
                                                알림이 없습니다
                                            </div>
                                        ) : (
                                            <>
                                                {notifications.map((notification) => (
                                                    <div
                                                        key={notification.id}
                                                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                                            !notification.isRead ? 'bg-blue-50 border-l-4 border-l-point' : ''
                                                        }`}
                                                        onClick={() => markNotificationAsRead(notification.id)}
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <p className={`text-sm ${
                                                                        !notification.isRead ? 'text-gray-900 font-medium' : 'text-gray-700'
                                                                    }`}>
                                                                        {notification.content}
                                                                    </p>
                                                                    {!notification.isRead && (
                                                                        <div className="w-2 h-2 bg-point rounded-full flex-shrink-0"></div>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {formatTime(notification.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {/* 더보기 버튼 */}
                                                {hasMore && (
                                                    <div className="px-4 py-3 border-t border-gray-100">
                                                        <button
                                                            onClick={loadMoreNotifications}
                                                            disabled={isLoading}
                                                            className="w-full text-center text-sm text-point hover:text-point/80 disabled:opacity-50"
                                                        >
                                                            {isLoading ? '로딩 중...' : '더 보기'}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 우측 액션 버튼들 */}
                        <div className="flex items-center space-x-2">
                            {rightActions ? (
                                rightActions
                            ) : (
                                <button
                                    onClick={() => {
                                        // 로그아웃 기능은 나중에 구현
                                        alert('로그아웃 기능은 아직 구현되지 않았습니다.');
                                    }}
                                    className="flex items-center space-x-1 px-3 py-2 text-sm text-point hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                                        />
                                    </svg>
                                    <span>로그아웃</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;