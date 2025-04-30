import React from "react";
import "./style.css";

// 소셜 로그인 버튼 컴포넌트
function SocialLoginButton({ provider, onClick }) {
  const providerNames = {
    google: "Google로 로그인",
    naver: "Naver로 로그인",
    kakao: "Kakao로 로그인",
  };
  return (
    <button className={`social-btn ${provider}`} onClick={onClick}>
      {providerNames[provider]}
    </button>
  );
}

function Login() {
  return (
    <div className="main-bg">
      <div className="card">
        <h2 className="main-title">Momentree</h2>
        <p className="subtitle">가득 데이트 마일돌 케어 서비스</p>
        <div className="btn-group">
          <SocialLoginButton
            provider="google"
            onClick={() => alert("Google 로그인")}
          />
          <SocialLoginButton
            provider="naver"
            onClick={() => alert("Naver 로그인")}
          />
          <SocialLoginButton
            provider="kakao"
            onClick={() => alert("Kakao 로그인")}
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
