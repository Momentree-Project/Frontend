export function ScheduleList({ scheduleList, onAddClick, onItemClick, onEditClick, onDeleteClick }) {
    return (
        <>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-[17px] font-semibold text-point m-0">일정 목록</h3>
            </div>
            <ul className="list-none p-0 m-0">
                {scheduleList.map((item, idx) => (
                    <li
                        key={idx}
                        onClick={() => onItemClick(item.id)}
                        className="bg-white rounded-[10px] px-[14px] py-[12px] mb-[8px] flex justify-between items-center text-point text-[16px] font-medium shadow-[0_1px_4px_#eaece3] cursor-pointer"
                    >
                        <span>{item.title}</span>
                        <div className="flex items-center gap-2">
                            <span className="text-subpoint text-[15px]">{item.weather}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();  // 이벤트 버블링 방지
                                    onEditClick(item.id);
                                }}
                                className="text-point hover:text-[#435045] font-medium text-[14px] transition-colors"
                            >
                                수정
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();  // 이벤트 버블링 방지
                                    onDeleteClick(item.id);
                                }}
                                className="text-[#E07474] hover:text-[#D05A5A] font-medium text-[14px] transition-colors"
                            >
                                삭제
                            </button>
                        </div>
                    </li>
                ))}
                {scheduleList.length === 0 && (
                    <li className="bg-white rounded-[10px] px-[14px] py-[12px] mb-[8px] flex justify-center items-center text-subpoint text-[15px] shadow-[0_1px_4px_#eaece3]">
                        일정이 없습니다.
                    </li>
                )}
            </ul>
        </>
    );
}
