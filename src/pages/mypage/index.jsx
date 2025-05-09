import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance"; // axiosInstance.js 경로에 맞게 수정

function MyPage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [maxDate, setMaxDate] = useState("");
  const [minDate, setMinDate] = useState("");
  const [birthError, setBirthError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // 편집 상태 관리
  const [editingSection, setEditingSection] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/v1/users/me");
        setProfile(response.data.data);
        setEditData(response.data.data); // 초기 편집 데이터 설정
        setLoading(false);
      } catch (err) {
        console.error("프로필 정보를 불러오는데 실패했습니다:", err);
        if (err.response) {
          if (err.response.status === 401) {
            setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
            navigate("/", { replace: true });
          } else {
            setError(
              err.response.data.message ||
                "서버 오류가 발생했습니다. 다시 시도해주세요."
            );
          }
        } else {
          setError("서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요.");
        }
        setLoading(false);
      }
    };

    fetchProfile();

    // 오늘 날짜를 yyyy-mm-dd 형식으로 구하기
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const formattedToday = `${year}-${month}-${day}`;
    // 만 14세 이상만 선택 가능하도록 최소 날짜 설정
    const minYear = year - 100; // 최대 100세
    const maxYear = year - 14; // 최소 14세
    const minDateValue = `${minYear}-01-01`;
    const maxDateValue = `${maxYear}-${month}-${day}`;

    setMaxDate(formattedToday);
    setMinDate(minDateValue);
  }, [navigate]);
  // 생년월일 유효성 검사 함수
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

  // 이름 유효성 검사 함수
  const validateUsername = (username) => {
    if (!username || username.trim() === "") {
      setUsernameError("이름을 입력해주세요.");
      return false;
    }

    if (username.trim().length < 2) {
      setUsernameError("이름은 2글자 이상이어야 합니다.");
      return false;
    }

    setUsernameError("");
    return true;
  };

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 생년월일 변경 시 유효성 검사
    if (name === "birth") {
      validateBirth(value);
    }

    // 이름 변경 시 유효성 검사
    if (name === "username") {
      validateUsername(value);
    }

    setEditData({
      ...editData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 섹션 저장 핸들러
  const handleSaveSection = async (section) => {
    // 프로필 섹션에서 이름 유효성 검사
    if (section === "profile" && !validateUsername(editData.username)) {
      return;
    }

    // 개인정보 섹션에서 생년월일 유효성 검사
    if (section === "personal" && !validateBirth(editData.birth)) {
      return;
    }
    // localStorage에서 데이터 가져오기
    const loginUserInfoStr = localStorage.getItem("loginUserInfo");

    // JSON 문자열을 객체로 변환
    const loginUserInfo = JSON.parse(loginUserInfoStr);

    // coupleId 추출
    const coupleId = loginUserInfo.coupleId;

    console.log(coupleId); // 1
    try {
      let endpoint = "";
      let data = {};
      let response;

      // 섹션별 엔드포인트와 데이터 준비
      if (section === "profile") {
        endpoint = "/api/v1/users/me/profile";
        data = {
          username: editData.username,
          statusMessage: editData.statusMessage,
        };
      } else if (section === "personal") {
        endpoint = "/api/v1/users/me/personal";
        data = {
          birth: editData.birth,
          location: editData.location,
        };
      } else if (section === "couple") {
        endpoint = "/api/v1/users/me/coupleStartedDay";
        data = {
          coupleId: coupleId,
          coupleStartedDay: editData.coupleStartedDay,
        };
      } else if (section === "marketing") {
        endpoint = "/api/v1/users/me/marketing-consent";
        data = {
          marketingConsent: editData.marketingConsent,
        };
      }

      // 해당 섹션의 API 호출
      response = await api.patch(endpoint, data);

      // 응답 데이터로 프로필 상태 업데이트
      setProfile({ ...profile, ...response.data.data });
      setEditingSection(null);
      alert("정보가 수정되었습니다.");
    } catch (error) {
      console.error("정보 수정 실패:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(`정보 수정에 실패했습니다: ${error.response.data.message}`);
      } else {
        alert("정보 수정에 실패했습니다.");
      }
    }
  };

  // 모달 상태 관리
  const [showBreakupModal, setShowBreakupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleBreakupCouple = async () => {
    try {
      await api.delete("/api/v1/couples");

      alert("커플 연결이 해제되었습니다.");
      window.location.reload();
    } catch (error) {
      console.error("커플 연결 해제 실패:", error);
      alert("커플 연결 해제에 실패했습니다.");
    }
    setShowBreakupModal(false);
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/api/v1/users/me");

      localStorage.removeItem("accessToken");
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("회원 탈퇴 실패:", error);
      alert("회원 탈퇴에 실패했습니다.");
    }
    setShowDeleteModal(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        프로필 정보를 불러올 수 없습니다.
      </div>
    );
  }

  const calculateDays = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const today = new Date();
    const diffTime = Math.abs(today - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysCount = calculateDays(profile.coupleStartedDay);

  return (
    <div className="bg-mainbg min-h-screen p-4 pb-20">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <button className="text-point">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      {/* 프로필 카드 */}
      <div className="bg-cardbg rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-point">프로필 정보</h3>
          {editingSection !== "profile" ? (
            <button
              className="text-point text-sm font-medium"
              onClick={() => setEditingSection("profile")}
            >
              수정
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                className="text-gray-500 text-sm font-medium"
                onClick={() => setEditingSection(null)}
              >
                취소
              </button>
              <button
                className="text-point text-sm font-medium"
                onClick={() => handleSaveSection("profile")}
              >
                저장
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center">
          {/* 프로필 이미지 섹션 - 좌우 마진 추가 */}
          <div className="mb-6 md:mb-0 flex flex-col items-center justify-center md:mx-4">
            <div className="relative">
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="프로필"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-subpoint rounded-full flex items-center justify-center text-white text-4xl">
                  {profile?.username?.charAt(0) || ""}
                </div>
              )}
              <input
                type="file"
                id="profileImageInput"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) {
                      // 2MB 제한
                      alert("이미지 크기는 2MB 이하여야 합니다.");
                      return;
                    }

                    // 이미지 파일을 FormData에 추가하여 서버에 전송하는 로직
                    const formData = new FormData();
                    formData.append("profileImage", file);

                    const accessToken = localStorage.getItem("accessToken");
                    const config = {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "multipart/form-data",
                      },
                    };

                    // 서버에 이미지 업로드
                    axios
                      .post(
                        "http://localhost:8080/api/v1/users/profile-image",
                        formData,
                        config
                      )
                      .then((response) => {
                        setProfile({
                          ...profile,
                          profileImageUrl: response.data.data.profileImageUrl,
                        });
                        alert("프로필 이미지가 업로드되었습니다.");
                      })
                      .catch((error) => {
                        console.error("이미지 업로드 실패:", error);
                        alert("이미지 업로드에 실패했습니다.");
                      });
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="profileImageInput"
                className="absolute bottom-0 right-0 bg-point text-white rounded-full w-8 h-8 flex items-center justify-center cursor-pointer shadow-md hover:bg-opacity-90 transition-all"
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
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </label>
            </div>
            <p className="text-textsub text-sm mt-2">프로필 사진</p>
          </div>

          {/* 프로필 정보 섹션 */}
          <div className="flex-1 md:ml-4">
            {/* 이름 */}
            <div className="mb-4">
              <p className="text-textsub mb-1">이름</p>
              {editingSection === "profile" ? (
                <div>
                  <input
                    type="text"
                    name="username"
                    value={editData.username || ""}
                    onChange={handleChange}
                    className={`w-full p-2 border ${
                      usernameError ? "border-red-500" : "border-subpoint"
                    } rounded-lg`}
                    placeholder="이름 (2글자 이상)"
                  />
                  {usernameError && (
                    <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                  )}
                </div>
              ) : (
                <p className="text-textmain">
                  {profile?.username || "이름 없음"}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div className="mb-4">
              <p className="text-textsub mb-1">이메일</p>
              <p className="text-textmain">{profile?.email || "이메일 없음"}</p>
            </div>

            {/* 상태 메시지 */}
            <div className="mb-0">
              <p className="text-textsub mb-1">상태 메시지</p>
              {editingSection === "profile" ? (
                <textarea
                  name="statusMessage"
                  value={editData.statusMessage || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-subpoint rounded-lg"
                  placeholder="상태 메시지를 입력하세요"
                  rows="2"
                />
              ) : (
                <p className="text-textmain">
                  {profile?.statusMessage || "상태 메시지가 없습니다."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 개인 정보 카드 */}
      <div className="bg-cardbg rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-point">개인 정보</h3>
          {editingSection !== "personal" ? (
            <button
              className="text-point text-sm font-medium"
              onClick={() => setEditingSection("personal")}
            >
              수정
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                className="text-gray-500 text-sm font-medium"
                onClick={() => setEditingSection(null)}
              >
                취소
              </button>
              <button
                className="text-point text-sm font-medium"
                onClick={() => handleSaveSection("personal")}
              >
                저장
              </button>
            </div>
          )}
        </div>

        {/* 생년월일 */}
        <div className="mb-4">
          <p className="text-textsub mb-1">생년월일</p>
          {editingSection === "personal" ? (
            <div>
              <input
                type="date"
                name="birth"
                value={editData.birth || ""}
                onChange={handleChange}
                min={minDate}
                max={maxDate}
                className={`w-full p-2 border ${
                  birthError ? "border-red-500" : "border-subpoint"
                } rounded-lg`}
              />
              {birthError && (
                <p className="text-red-500 text-xs mt-1">{birthError}</p>
              )}
              <p className="text-xs text-textsub mt-1">
                만 14세 이상만 등록 가능합니다.
              </p>
            </div>
          ) : (
            <p className="text-textmain">{profile?.birth || "정보 없음"}</p>
          )}
        </div>

        {/* 지역 */}
        <div className="mb-0">
          <p className="text-textsub mb-1">지역</p>
          {editingSection === "personal" ? (
            <select
              name="location"
              value={editData.location || ""}
              onChange={handleChange}
              className="w-full p-2 border border-subpoint rounded-lg bg-white"
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
          ) : (
            <p className="text-textmain">{profile?.location || "정보 없음"}</p>
          )}
        </div>
      </div>

      {/* 커플 정보 카드 */}
      <div className="bg-cardbg rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-point">커플 정보</h3>
          {editingSection !== "couple" ? (
            <button
              className="text-point text-sm font-medium"
              onClick={() => setEditingSection("couple")}
            >
              수정
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                className="text-gray-500 text-sm font-medium"
                onClick={() => setEditingSection(null)}
              >
                취소
              </button>
              <button
                className="text-point text-sm font-medium"
                onClick={() => handleSaveSection("couple")}
              >
                저장
              </button>
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-textsub mb-1">함께한 일수</p>
          <p className="text-textmain font-bold">{daysCount}일</p>
        </div>

        <div className="mb-4">
          <p className="text-textsub mb-1">시작일</p>
          {editingSection === "couple" ? (
            <input
              type="date"
              name="coupleStartedDay"
              value={editData.coupleStartedDay || ""}
              max={maxDate}
              onChange={handleChange}
              className="w-full p-2 border border-subpoint rounded-lg"
            />
          ) : (
            <p className="text-textmain">
              {profile.coupleStartedDay || "정보 없음"}
            </p>
          )}
        </div>

        <div>
          <p className="text-textsub mb-1">파트너</p>
          <p className="text-textmain">{profile.partnerEmail || "정보 없음"}</p>
        </div>
      </div>

      {/* 마케팅 수신 정보 카드 */}
      <div className="bg-cardbg rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-point">마케팅 수신 정보</h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-3 sm:mb-0">
            <p className="text-textmain">마케팅 정보 수신 동의</p>
            <p className="text-textsub text-sm">
              이벤트 및 프로모션 정보를 이메일로 받아보실 수 있습니다.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="marketingConsent"
              className="sr-only peer"
              checked={profile.marketingConsent || false}
              onChange={async (e) => {
                try {
                  const newValue = e.target.checked;

                  // 임시로 UI 상태 업데이트 (즉각적인 피드백)
                  setProfile({
                    ...profile,
                    marketingConsent: newValue,
                  });

                  await api.patch("/api/v1/users/me/marketing-consent", {
                    marketingConsent: newValue,
                  });

                  // 성공 시 알림 (선택 사항)
                  console.log("마케팅 수신 설정이 변경되었습니다.");
                } catch (error) {
                  console.error("마케팅 수신 설정 변경 실패:", error);

                  // 실패 시 원래 상태로 되돌림
                  setProfile({
                    ...profile,
                    marketingConsent: !e.target.checked,
                  });

                  alert("마케팅 수신 설정 변경에 실패했습니다.");
                }
              }}
            />
            <div
              className={`w-11 h-6 rounded-full peer ${
                profile.marketingConsent ? "bg-point" : "bg-gray-300"
              } peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
            ></div>
          </label>
        </div>
      </div>

      {/* 위험 구역 (Danger Zone) */}
      <div className="bg-cardbg rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-lg font-bold text-red-500 mb-4">Danger Zone</h3>

        <div className="border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-3 sm:mb-0 sm:pr-4">
              <p className="text-textmain font-medium">커플 연결 끊기</p>
              <p className="text-textsub text-sm">
                파트너와의 연결을 해제합니다. 이 작업은 되돌릴 수 없습니다.
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-white text-red-500 border border-red-500 rounded-lg hover:bg-red-50 whitespace-nowrap"
              onClick={() => setShowBreakupModal(true)}
            >
              연결 끊기
            </button>
          </div>
        </div>

        <div className="border border-red-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="mb-3 sm:mb-0 sm:pr-4">
              <p className="text-textmain font-medium">회원 탈퇴</p>
              <p className="text-textsub text-sm">
                계정을 영구적으로 삭제합니다. 모든 데이터가 삭제되며 복구할 수
                없습니다.
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-4 py-2 bg-white text-red-500 border border-red-500 rounded-lg hover:bg-red-50 whitespace-nowrap"
              onClick={() => setShowDeleteModal(true)}
            >
              탈퇴하기
            </button>
          </div>
        </div>
      </div>

      {/* 모달 */}
      {showBreakupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h4 className="text-lg font-bold mb-4">커플 연결 끊기</h4>
            <p className="mb-6">
              정말로 파트너와의 연결을 끊으시겠습니까? 이 작업은 되돌릴 수
              없습니다.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setShowBreakupModal(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={handleBreakupCouple}
              >
                연결 끊기
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h4 className="text-lg font-bold mb-4">회원 탈퇴</h4>
            <p className="mb-6">
              정말로 탈퇴하시겠습니까? 모든 데이터가 영구적으로 삭제됩니다.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={handleDeleteAccount}
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPage;
