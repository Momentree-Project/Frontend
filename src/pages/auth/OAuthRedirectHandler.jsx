import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("get요청");
        const response = await axios.get(
          `http://localhost:8080/api/v1/auth/refresh-token`,
          { withCredentials: true }
        );
        console.log("전체 응답", response);
        if (response.data.data) {
          const loginUserInfo = {
            username: response.data.data.username,
            email: response.data.data.email,
            userCode: response.data.data.userCode,
            coupleId: response.data.data.coupleId,
          };
          const accessToken = response.data.data.accessToken;
          console.log("로그인 유저 정보", loginUserInfo);
          console.log("accessToken", accessToken);

          localStorage.setItem("loginUserInfo", JSON.stringify(loginUserInfo));
          localStorage.setItem("accessToken", accessToken);

          // accessToken을 axios 기본 헤더에 저장
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${accessToken}`;
          console.log(
            "설정된 헤더",
            axios.defaults.headers.common["Authorization"]
          );

          // coupleId 유무에 따라 다른 페이지로 리다이렉트
          if (loginUserInfo.coupleId) {
            console.log("커플 연결 완료 상태: /home으로 리다이렉트");
            navigate("/home", { replace: true });
          } else {
            console.log("커플 연결 필요 상태: /connect로 리다이렉트");
            navigate("/connect", { replace: true });
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
