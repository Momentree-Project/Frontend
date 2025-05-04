import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function CoupleConnect() {
  const location = useLocation();
  const navigate = useNavigate();
  const [userCode, setuserCode] = useState("");
  const [coupleStartedDay, setcoupleStartedDay] = useState("");
  const [myCode, setMyCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // 로컬 스토리지에서 loginUserInfo 가져오기
    const storedUserInfo = localStorage.getItem("loginUserInfo");

    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        if (parsedUserInfo.userCode) {
          setMyCode(parsedUserInfo.userCode);
        }
      } catch (error) {
        console.error("로컬 스토리지 데이터 파싱 오류:", error);
      }
    }
  }, [location.state]);

  const handleConnect = async (e) => {
    e.preventDefault();

    if (!userCode || !coupleStartedDay) {
      setError("코드와 시작일을 모두 입력해주세요.");
      return;
    }

    try {
      // 로컬 스토리지에서 액세스 토큰 가져오기
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("로그인이 필요합니다.");
        navigate("/", { replace: true });
        return;
      }

      // 요청 헤더에 토큰 포함
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };
      // API 요청 보내기
      const response = await axios.post(
        "http://localhost:8080/api/v1/couple/connect",
        {
          userCode: userCode,
          coupleStartedDay: coupleStartedDay,
        },
        config
      );

      console.log("커플 연결 응답:", response.data);

      if (response.data.code === 200) {
        // 성공 시 홈 페이지로 이동
        alert("커플 연결이 완료되었습니다!");
        navigate("/home", { replace: true });
      } else {
        setError(response.data.message || "연결에 실패했습니다.");
      }
    } catch (err) {
      console.error("커플 연결 오류:", err);
      if (err.response) {
        setError(
          err.response.data.message ||
            "서버 오류가 발생했습니다. 다시 시도해주세요."
        );
      } else {
        setError("서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mainbg text-textmain font-noto">
      <div className="bg-cardbg rounded-[18px] shadow-md p-8 w-[320px] flex flex-col items-center">
        <h2 className="text-xl font-bold mb-6">커플 연결</h2>

        <form onSubmit={handleConnect} className="w-full">
          <div className="mb-4">
            <label className="block text-textsub mb-2">상대방 코드</label>
            <input
              type="text"
              value={userCode}
              onChange={(e) => setuserCode(e.target.value)}
              placeholder="상대방의 코드를 입력하세요"
              className="w-full p-3 rounded-lg border border-subpoint focus:outline-none focus:ring-1 focus:ring-point"
            />
          </div>

          <div className="mb-6">
            <label className="block text-textsub mb-2">
              사귀기 시작한 날짜
            </label>
            <input
              type="date"
              value={coupleStartedDay}
              onChange={(e) => setcoupleStartedDay(e.target.value)}
              className="w-full p-3 rounded-lg border border-subpoint focus:outline-none focus:ring-1 focus:ring-point"
            />
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-point text-white font-semibold hover:bg-opacity-90"
          >
            연결하기
          </button>
        </form>

        <div className="mt-8 w-full">
          <h3 className="text-md font-bold mb-2">내 커플 코드</h3>
          <div className="bg-white p-4 rounded-lg border border-subpoint flex justify-between items-center">
            <span className="text-lg font-bold text-point">{myCode}</span>
            <button
              className="text-point"
              onClick={() => {
                navigator.clipboard.writeText(myCode);
                alert("코드가 클립보드에 복사되었습니다.");
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-textsub mt-2">
            상대방에게 이 코드를 공유하여 연결할 수 있어요
          </p>
        </div>
      </div>
    </div>
  );
}

export default CoupleConnect;
