import { Link, useLocation } from 'react-router-dom';

export function Footer() {
    const location = useLocation();
    
    const isActive = (path) => {
        return location.pathname === path;
    };

    // 아직 구현되지 않은 페이지 클릭 방지
    const handleNotImplemented = (e) => {
        e.preventDefault();
        alert('준비 중인 기능입니다.');
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center">
            <footer className="w-full max-w-[600px] bg-white border-t border-gray-100 px-4 py-2.5 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between">
                    {/* 지도 */}
                    <Link 
                        to="/map" 
                        onClick={handleNotImplemented}
                        className={`flex flex-col items-center gap-1 p-2 relative ${
                            isActive('/map') ? 'text-point' : 'text-subpoint'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive('/map') ? 'drop-shadow-sm' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/map') ? 2.2 : 1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span className="text-xs font-medium">지도</span>
                        {isActive('/map') && <div className="absolute -bottom-2 w-8 h-1 rounded-full bg-point"></div>}
                    </Link>

                    {/* 게시판 */}
                    <Link 
                        to="/board" 
                        onClick={handleNotImplemented}
                        className={`flex flex-col items-center gap-1 p-2 relative ${
                            isActive('/board') ? 'text-point' : 'text-subpoint'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive('/board') ? 'drop-shadow-sm' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/board') ? 2.2 : 1.8} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                        <span className="text-xs font-medium">게시판</span>
                        {isActive('/board') && <div className="absolute -bottom-2 w-8 h-1 rounded-full bg-point"></div>}
                    </Link>

                    {/* 홈 */}
                    <Link 
                        to="/home" 
                        className={`flex flex-col items-center gap-1 p-2 relative ${
                            isActive('/home') ? 'text-point' : 'text-subpoint'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive('/home') ? 'drop-shadow-sm' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/home') ? 2.2 : 1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        <span className="text-xs font-medium">홈</span>
                        {isActive('/home') && <div className="absolute -bottom-2 w-8 h-1 rounded-full bg-point"></div>}
                    </Link>

                    {/* 일정 */}
                    <Link 
                        to="/schedule" 
                        className={`flex flex-col items-center gap-1 p-2 relative ${
                            isActive('/schedule') ? 'text-point' : 'text-subpoint'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive('/schedule') ? 'drop-shadow-sm' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/schedule') ? 2.2 : 1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs font-medium">일정</span>
                        {isActive('/schedule') && <div className="absolute -bottom-2 w-8 h-1 rounded-full bg-point"></div>}
                    </Link>

                    {/* 마이페이지 */}
                    <Link 
                        to="/mypage" 
                        className={`flex flex-col items-center gap-1 p-2 relative ${
                            isActive('/mypage') ? 'text-point' : 'text-subpoint'
                        }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive('/mypage') ? 'drop-shadow-sm' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/mypage') ? 2.2 : 1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-xs font-medium">마이</span>
                        {isActive('/mypage') && <div className="absolute -bottom-2 w-8 h-1 rounded-full bg-point"></div>}
                    </Link>
                </div>
            </footer>
        </div>
    );
} 