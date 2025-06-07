import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import logo from '../assets/images/logo.png';

const Header = () => {
    const {
        notifications,
        isConnected,
        unreadCount,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications
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
        setIsNotificationOpen(!isNotificationOpen);
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
        <div className="fixed top-0 left-0 right-0 flex justify-center z-40">
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
                            {/* SSE 연결 상태 표시 */}
                            <div className="ml-2 flex items-center">
                                <div 
                                    className={`w-2 h-2 rounded-full ${
                                        isConnected ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    title={isConnected ? '연결됨' : '연결 끊김'}
                                />
                            </div>
                        </div>

                        {/* 가운데 알림 텍스트 */}
                        <div className="flex-1 mx-4 relative" ref={notificationRef}>
                            <button
                                onClick={toggleNotification}
                                className={`w-full text-center px-3 py-2 rounded-lg transition-colors relative ${
                                    notifications.length > 0 && !notifications[0]?.read
                                        ? 'text-point font-medium hover:bg-point/5'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <div className="truncate text-sm">
                                    {notifications.length > 0 
                                        ? notifications[0].title
                                        : '새로운 알림이 없습니다'
                                    }
                                </div>
                                {/* 읽지 않은 알림 개수 표시 */}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* 알림 드롭다운 */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                                    {/* 드롭다운 헤더 */}
                                    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">알림</h3>
                                        <div className="flex items-center space-x-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={markAllAsRead}
                                                    className="text-sm text-point hover:text-point/80"
                                                >
                                                    모두 읽음
                                                </button>
                                            )}
                                            <button
                                                onClick={clearAllNotifications}
                                                className="text-sm text-gray-500 hover:text-gray-700"
                                            >
                                                모두 삭제
                                            </button>
                                        </div>
                                    </div>

                                    {/* 알림 목록 */}
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="px-4 py-8 text-center text-gray-500">
                                                알림이 없습니다
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                                        !notification.read ? 'bg-blue-50' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div 
                                                            className="flex-1 cursor-pointer"
                                                            onClick={() => markAsRead(notification.id)}
                                                        >
                                                            <div className="flex items-center space-x-2">
                                                                <h4 className={`text-sm font-medium ${
                                                                    !notification.read ? 'text-gray-900' : 'text-gray-700'
                                                                }`}>
                                                                    {notification.title}
                                                                </h4>
                                                                {!notification.read && (
                                                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {formatTime(notification.timestamp)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeNotification(notification.id)}
                                                            className="text-gray-400 hover:text-gray-600 ml-2"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 우측 로그아웃 버튼 */}
                        <div>
                            <button
                                onClick={() => {
                                    // 로그아웃 기능은 나중에 구현
                                    alert('로그아웃 기능은 아직 구현되지 않았습니다.');
                                }}
                                className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default Header;