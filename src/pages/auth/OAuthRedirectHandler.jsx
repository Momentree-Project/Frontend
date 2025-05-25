import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axiosInstance"; // axiosInstance.js 경로에 맞게 수정

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("get요청");
        const response = await api.get(`/api/v1/auth/refresh-token`, {
          withCredentials: true,
        });
        console.log("전체 응답", response);
        if (response.data.data) {
          const loginUserInfo = {
            username: response.data.data.username,
            email: response.data.data.email,
            userCode: response.data.data.userCode,
            birth: response.data.data.birth,
            coupleId: response.data.data.coupleId,
            status: response.data.data.status,
            coupleStartedDay: response.data.data.coupleStartedDay,
          };
          const accessToken = response.data.data.accessToken;
          console.log("로그인 유저 정보", loginUserInfo);
          console.log("accessToken", accessToken);

          localStorage.setItem("loginUserInfo", JSON.stringify(loginUserInfo));
          localStorage.setItem("accessToken", accessToken);

          if (loginUserInfo.status === "INACTIVE") {
            // 비활성화 상태일 경우
            console.log("비활성화 상태: /recover로 리다이렉트");
            navigate("/recover", { replace: true });
          }
          // coupleId와 birth 유무에 따라 다른 페이지로 리다이렉트
          else if (!loginUserInfo.birth) {
            // birth 정보가 없으면 추가 정보 입력 페이지로 우선 이동
            console.log("개인정보 입력 필요: /additional-info로 리다이렉트");
            navigate("/additional-info", { replace: true });
          } else if (!loginUserInfo.coupleId) {
            // birth는 있지만 coupleId가 없으면 커플 연결 페이지로 이동
            console.log("커플 연결 필요: /connect로 리다이렉트");
            navigate("/connect", { replace: true });
          } else {
            // birth와 coupleId 모두 있으면 홈으로 이동
            console.log("모든 정보 완료 상태: /home으로 리다이렉트");
            navigate("/home", { replace: true });
          }
        }
      } catch (error) {
        console.error("API 요청 오류:", error);
        await navigate("/", { replace: true });
      }
    };

    fetchUserInfo();
  }, [navigate]);

  return <div>로그인 처리중...</div>;
};

export default OAuth2RedirectHandler;
