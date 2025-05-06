// src/pages/authAdditionalInfo/index.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AdditionalInfo() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    birth: "",
    location: "",
    statusMessage: "",
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [birthError, setBirthError] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [privacyError, setPrivacyError] = useState("");

  // 생년월일 제한 설정
  useEffect(() => {
    // 오늘 날짜 계산
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    // 최대 날짜 (오늘)
    const maxDate = `${year}-${month}-${day}`;

    // 최소 날짜 (만 14세 이상, 100세 이하)
    const minYear = year - 100;
    const maxYear = year - 14;
    const minDate = `${minYear}-${month}-${day}`;

    // input 요소에 min, max 속성 설정
    const birthInput = document.getElementById("birth");
    if (birthInput) {
      birthInput.setAttribute("max", maxDate);
      birthInput.setAttribute("min", `${minYear}-01-01`);
    }
  }, []);

  const validateBirth = (birthDate) => {
    if (!birthDate) {
      setBirthError("생년월일을 입력해주세요.");
      return false;
    }

    const today = new Date();
    const birthDateObj = new Date(birthDate);

    // 유효한 날짜인지 확인
    if (isNaN(birthDateObj.getTime())) {
      setBirthError("유효하지 않은 날짜입니다.");
      return false;
    }

    // 미래 날짜인지 확인
    if (birthDateObj > today) {
      setBirthError("미래 날짜는 선택할 수 없습니다.");
      return false;
    }

    // 만 14세 이상인지 확인
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 14);
    if (birthDateObj > minAgeDate) {
      setBirthError("만 14세 이상만 가입 가능합니다.");
      return false;
    }

    // 100세 이하인지 확인
    const maxAgeDate = new Date();
    maxAgeDate.setFullYear(today.getFullYear() - 100);
    if (birthDateObj < maxAgeDate) {
      setBirthError("생년월일을 다시 확인해주세요.");
      return false;
    }

    setBirthError("");
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // privacyConsent와 marketingConsent를 명확히 구분
    if (name === "privacyConsent") {
      // privacy 동의는 별도 상태로 관리하고
      setPrivacyConsent(checked);
      // if (checked) {
      //   setPrivacyError("");
      // }
    } else {
      // 다른 입력 필드 처리
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });

      // 생년월일 변경 시 유효성 검사
      if (name === "birth") {
        validateBirth(value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 생년월일 최종 유효성 검사
    if (!validateBirth(formData.birth)) {
      return;
    }

    // 개인정보 수집 동의 확인
    if (!privacyConsent) {
      setPrivacyError(
        "개인정보 수집 및 이용에 동의해야 서비스를 이용할 수 있습니다."
      );
      return;
    }

    setLoading(true);
    setError("");

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
      // 서버로 전송하기 전에 명시적으로 불리언 타입으로 변환
      const dataToSend = {
        ...formData,
        marketingConsent: Boolean(formData.marketingConsent),
      };

      // API 요청 보내기
      const response = await axios.post(
        "http://localhost:8080/api/v1/user/additional-info",
        dataToSend
      );

      console.log("추가 정보 제출 응답:", response.data);

      // 로컬 스토리지에서 storedUserInfo 가져오기
      const loginUserInfo = localStorage.getItem("loginUserInfo");

      if (response.data.success || response.status === 200) {
        // coupleId 유무에 따라 다른 페이지로 리다이렉트
        if (!loginUserInfo.coupleId) {
          // birth는 있지만 coupleId가 없으면 커플 연결 페이지로 이동
          console.log("커플 연결 필요: /connect로 리다이렉트");
          navigate("/connect", { replace: true });
        } else {
          // birth와 coupleId 모두 있으면 홈으로 이동
          console.log("모든 정보 완료 상태: /home으로 리다이렉트");
          navigate("/home", { replace: true });
        }
      } else {
        setError(response.data.message || "정보 제출에 실패했습니다.");
      }
    } catch (err) {
      console.error("추가 정보 제출 오류:", err);
      if (err.response) {
        setError(
          err.response.data.message ||
            "서버 오류가 발생했습니다. 다시 시도해주세요."
        );
      } else {
        setError("서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-mainbg text-textmain font-noto py-8">
      <div className="bg-cardbg rounded-[18px] shadow-md p-8 w-[90%] max-w-[450px] flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-6 text-point">추가 정보 입력</h2>
        <p className="text-textsub mb-6 text-center">
          서비스 이용을 위해 몇 가지 정보가 필요해요.
        </p>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-5">
            <label
              className="block text-textmain font-medium mb-2"
              htmlFor="birth"
            >
              생년월일
            </label>
            <input
              type="date"
              id="birth"
              name="birth"
              value={formData.birth}
              onChange={handleChange}
              className={`w-full p-3 rounded-lg border ${
                birthError ? "border-red-500" : "border-subpoint"
              } focus:outline-none focus:ring-1 focus:ring-point bg-white`}
              required
            />
            {birthError && (
              <p className="mt-1 text-red-500 text-sm">{birthError}</p>
            )}
            <p className="mt-1 text-textsub text-xs">
              만 14세 이상만 가입 가능합니다.
            </p>
          </div>

          <div className="mb-5">
            <label
              className="block text-textmain font-medium mb-2"
              htmlFor="location"
            >
              지역 (선택사항)
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-subpoint focus:outline-none focus:ring-1 focus:ring-point bg-white"
            >
              <option value="">지역을 선택해주세요</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="인천">인천</option>
              <option value="강원">강원</option>
              <option value="충북">충북</option>
              <option value="충남">충남</option>
              <option value="대전">대전</option>
              <option value="경북">경북</option>
              <option value="경남">경남</option>
              <option value="대구">대구</option>
              <option value="울산">울산</option>
              <option value="부산">부산</option>
              <option value="전북">전북</option>
              <option value="전남">전남</option>
              <option value="광주">광주</option>
              <option value="제주">제주</option>
            </select>
            <p className="mt-1 text-textsub text-xs">
              위치 정보는 맞춤형 날씨 정보 제공을 위해 사용됩니다.
            </p>
          </div>

          <div className="mb-5">
            <label
              className="block text-textmain font-medium mb-2"
              htmlFor="statusMessage"
            >
              상태 메시지
            </label>
            <textarea
              id="statusMessage"
              name="statusMessage"
              value={formData.statusMessage}
              onChange={handleChange}
              placeholder="상태 메시지를 입력해주세요 (선택사항)"
              className="w-full p-3 rounded-lg border border-subpoint focus:outline-none focus:ring-1 focus:ring-point bg-white h-24 resize-none"
              maxLength={100}
            />
            <p className="mt-1 text-textsub text-xs text-right">
              {formData.statusMessage.length}/100
            </p>
          </div>

          {/* 개인정보 수집 및 이용 동의 (필수) */}
          <div className="mb-6 p-4 bg-white rounded-lg border border-subpoint">
            <div className="mb-3">
              <h3 className="font-medium text-textmain">
                개인정보 수집 및 이용 동의 (필수)
              </h3>
              <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-textsub h-32 overflow-y-auto">
                <p className="mb-2">
                  Momentree 서비스 제공을 위해 다음과 같이 개인정보를 수집 및
                  이용합니다.
                </p>
                <p className="mb-2">
                  <strong>수집항목</strong>: 생년월일, 지역, 상태 메시지
                </p>
                <p className="mb-2">
                  <strong>수집목적</strong>: 서비스 제공 및 개선, 맞춤형 콘텐츠
                  제공, 연령 확인, 맞춤형 날씨 정보 제공
                </p>
                <p className="mb-2">
                  <strong>보유기간</strong>: 회원 탈퇴 시까지 (단, 관계 법령에
                  따라 보존할 필요가 있는 경우 해당 기간 동안 보존)
                </p>
                <p className="mb-2">
                  위 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있으나,
                  동의를 거부할 경우 서비스 이용이 제한됩니다.
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="privacyConsent"
                name="privacyConsent"
                checked={privacyConsent}
                onChange={handleChange}
                className={`mr-2 h-5 w-5 text-point focus:ring-point ${
                  privacyError ? "border-red-500" : "border-subpoint"
                } rounded`}
              />
              <label
                className="text-textmain font-medium"
                htmlFor="privacyConsent"
              >
                개인정보 수집 및 이용에 동의합니다
              </label>
            </div>
            {privacyError && (
              <p className="mt-1 text-red-500 text-sm">{privacyError}</p>
            )}
          </div>

          {/* 마케팅 정보 수신 동의 (선택) */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="marketingConsent"
                name="marketingConsent"
                checked={formData.marketingConsent}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-point focus:ring-point border-subpoint rounded"
              />
              <label className="text-textsub" htmlFor="marketingConsent">
                마케팅 정보 수신에 동의합니다 (선택사항)
              </label>
            </div>
            <p className="mt-1 text-textsub text-xs ml-7">
              이벤트 및 혜택 정보를 SMS, 이메일로 받아보실 수 있습니다.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || birthError || !privacyConsent}
            className={`w-full py-3 rounded-lg bg-point text-white font-semibold transition-colors duration-200 ${
              loading || birthError || !privacyConsent
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-opacity-90"
            }`}
          >
            {loading ? "처리 중..." : "정보 제출하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdditionalInfo;
