export function ScheduleList({ scheduleList, onAddClick }) {
    return (
        <>
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-[16px] font-semibold text-point m-0">일정 목록</h3>
                <button
                    onClick={onAddClick}
                    className="bg-point text-white rounded-[8px] px-3 py-1 text-[14px] font-medium"
                >
                    일정 추가
                </button>
            </div>
            <ul className="list-none p-0 m-0">
                {scheduleList.map((item, idx) => (
                    <li
                        key={idx}
                        className="bg-white rounded-[10px] px-[12px] py-[10px] mb-[8px] flex justify-between items-center text-textmain text-[15px] shadow-[0_1px_4px_#eaece3]"
                    >
                        <span>{item.title}</span>
                        <span className="text-subpoint text-[14px]">{item.weather}</span>
                    </li>
                ))}
                {scheduleList.length === 0 && (
                    <li className="bg-white rounded-[10px] px-[12px] py-[10px] mb-[8px] flex justify-between items-center text-subpoint text-[15px] shadow-[0_1px_4px_#eaece3]">
                        일정이 없습니다.
                    </li>
                )}
            </ul>
        </>
    );
}
