import React, { useState } from 'react';

function Home() {
    // 임시로 성장 단계를 설정 (0~4)
    const [growthStage, setGrowthStage] = useState(2);
    
    // 나무는 자연스러운 색상, UI는 테마 색상 사용
    const treeStyles = [
        { // 단계 0: 씨앗
            height: '20px',
            width: '20px',
            backgroundColor: '#8B4513', // 갈색 씨앗
            borderRadius: '50%'
        },
        { // 단계 1: 새싹
            stemHeight: '30px',
            stemWidth: '10px',
            leafSize: '20px',
            stemColor: '#8B4513', // 갈색 줄기
            leafColor: '#90EE90' // 연한 초록색 잎
        },
        { // 단계 2: 작은 나무
            stemHeight: '60px',
            stemWidth: '15px',
            leafSize: '60px',
            stemColor: '#8B4513', // 갈색 줄기
            leafColor: '#32CD32' // 중간 초록색 잎
        },
        { // 단계 3: 중간 나무
            stemHeight: '100px',
            stemWidth: '20px',
            leafSize: '100px',
            stemColor: '#8B4513', // 갈색 줄기
            leafColor: '#228B22' // 진한 초록색 잎
        },
        { // 단계 4: 큰 나무
            stemHeight: '150px',
            stemWidth: '30px',
            leafSize: '150px',
            stemColor: '#8B4513', // 갈색 줄기
            leafColor: '#006400' // 매우 진한 초록색 잎
        }
    ];

    // 성장 단계를 올리는 함수
    const growTree = () => {
        if (growthStage < 4) {
            setGrowthStage(growthStage + 1);
        }
    };

    // 성장 단계를 내리는 함수
    const shrinkTree = () => {
        if (growthStage > 0) {
            setGrowthStage(growthStage - 1);
        }
    };

    return (
        <div className="bg-mainbg min-h-screen font-noto">
            <div className="flex flex-col gap-[16px] sm:gap-[28px] w-full max-w-[420px] mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {/* 나무 성장 카드 */}
                <section className="bg-cardbg rounded-[22px] shadow-[0_2px_12px_#e2e5db] px-[20px] py-[24px] flex flex-col gap-[16px] mb-0">
                    <div className="flex justify-between items-center mb-[8px]">
                        <div className="text-[17px] font-semibold text-point">모먼트리</div>
                        <div className="text-[14px] text-subpoint">성장 단계: {growthStage}/4</div>
                    </div>
                    
                    {/* 고정된 높이의 컨테이너 */}
                    <div className="flex items-center justify-center h-[250px] overflow-hidden relative">
                        <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2">
                            {growthStage === 0 ? (
                                // 씨앗
                                <div
                                    style={{
                                        height: treeStyles[0].height,
                                        width: treeStyles[0].width,
                                        backgroundColor: treeStyles[0].backgroundColor,
                                        borderRadius: treeStyles[0].borderRadius,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                ></div>
                            ) : (
                                // 나무 (단계 1-4)
                                <div className="relative flex flex-col items-center">
                                    {/* 나뭇잎 */}
                                    <div
                                        style={{
                                            width: treeStyles[growthStage].leafSize,
                                            height: treeStyles[growthStage].leafSize,
                                            backgroundColor: treeStyles[growthStage].leafColor,
                                            borderRadius: '50%',
                                            position: 'absolute',
                                            top: -5,
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            zIndex: 1,
                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                                        }}
                                    ></div>
                                    
                                    {/* 줄기 */}
                                    <div
                                        style={{
                                            width: treeStyles[growthStage].stemWidth,
                                            height: treeStyles[growthStage].stemHeight,
                                            backgroundColor: treeStyles[growthStage].stemColor,
                                            marginTop: parseInt(treeStyles[growthStage].leafSize) / 2,
                                            zIndex: 2,
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex justify-center gap-4 mt-2">
                        <button
                            onClick={shrinkTree}
                            disabled={growthStage === 0}
                            className={`px-4 py-2 rounded-[8px] text-[14px] font-medium ${
                                growthStage === 0 ? 'bg-gray-300 text-gray-500' : 'bg-subpoint text-white'
                            }`}
                        >
                            나무 줄이기
                        </button>
                        <button
                            onClick={growTree}
                            disabled={growthStage === 4}
                            className={`px-4 py-2 rounded-[8px] text-[14px] font-medium ${
                                growthStage === 4 ? 'bg-gray-300 text-gray-500' : 'bg-point text-white'
                            }`}
                        >
                            나무 키우기
                        </button>
                    </div>
                </section>
                
                {/* 안내 카드 */}
                <section className="bg-cardbg rounded-[22px] shadow-[0_2px_12px_#e2e5db] px-[20px] py-[24px] flex flex-col gap-[16px] mb-0">
                    <div className="text-[17px] font-semibold text-point mb-[8px]">모먼트리 성장 방법</div>
                    <ul className="text-[14px] text-textsub">
                        <li className="mb-3 flex items-center">
                            <div className="w-2 h-2 bg-point rounded-full mr-3"></div>
                            <span>데일리 로그인: <span className="text-point font-medium">+1 포인트</span></span>
                        </li>
                        <li className="mb-3 flex items-center">
                            <div className="w-2 h-2 bg-subpoint rounded-full mr-3"></div>
                            <span>일정 추가하기: <span className="text-point font-medium">+2 포인트</span></span>
                        </li>
                        <li className="mb-3 flex items-center">
                            <div className="w-2 h-2 bg-sunshine rounded-full mr-3"></div>
                            <span>게시글 작성: <span className="text-point font-medium">+3 포인트</span></span>
                        </li>
                        <li className="mb-3 flex items-center">
                            <div className="w-2 h-2 bg-textmain rounded-full mr-3"></div>
                            <span>특별 이벤트 참여: <span className="text-point font-medium">+5 포인트</span></span>
                        </li>
                    </ul>
                    <div className="mt-2 p-4 bg-[#F5F8F3] rounded-xl">
                        <p className="text-[13px] text-subpoint leading-relaxed">
                            모먼트리는 커플의 소중한 순간을 기록하고 나무를 키워나가는 서비스입니다. 
                            더 많은 활동을 통해 나무를 키우고 특별한 혜택을 누려보세요!
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Home;
