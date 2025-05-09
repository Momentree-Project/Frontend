import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance"; // axiosInstance.js 경로에 맞게 수정

function AccountRecovery() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleRecover = async () => {
    try {
      setIsLoading(true);

      // 로컬 스토리지에서 사용자 정보 가져오기
      const userInfo = JSON.parse(localStorage.getItem("loginUserInfo"));

      // API를 통해 계정 복구 요청
      await api.post("/api/v1/users/me/recover", {});

      // 로컬 스토리지의 status 업데이트
      userInfo.status = "ACTIVE";
      localStorage.setItem("loginUserInfo", JSON.stringify(userInfo));

      alert("계정이 성공적으로 복구되었습니다.");
      navigate("/home");
    } catch (error) {
      console.error("계정 복구 실패:", error);
      alert("계정 복구에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // 로그인 페이지로 이동
    localStorage.removeItem("loginUserInfo");
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mainbg font-noto">
      <div className="bg-cardbg p-8 rounded-[18px] shadow-md w-[360px] text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-textmain mb-2">계정 복구</h2>
          <p className="text-textsub">
            계정이 비활성화 상태입니다.
            <br />
            계정을 복구하시겠습니까?
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg mb-6 text-left">
          <p className="text-sm text-textsub mb-2">안내사항</p>
          <ul className="text-sm text-textmain list-disc pl-5 space-y-1">
            <li>계정 복구 시 기존 데이터가 모두 유지됩니다.</li>
            <li>복구를 취소하면 로그인 페이지로 이동합니다.</li>
          </ul>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-lg border border-subpoint text-textmain hover:bg-gray-100"
            disabled={isLoading}
          >
            취소하기
          </button>
          <button
            onClick={handleRecover}
            className="px-6 py-2.5 rounded-lg bg-point text-white hover:bg-opacity-90"
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "복구하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AccountRecovery;
