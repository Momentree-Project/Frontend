import React from "react";

function SocialLoginButton({ provider }) {
  const providerNames = {
    google: "Google로 로그인",
    naver: "Naver로 로그인",
    kakao: "Kakao로 로그인",
  };

  const providerStyles = {
    google: "bg-white text-textmain border border-point",
    naver: "bg-[#03c75a] text-white",
    kakao: "bg-[#fee500] text-[#3c1e1e]",
  };

  const handleLogin = () => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <button
      onClick={handleLogin}
      className={`w-full py-3 rounded-lg text-[1.1rem] font-semibold cursor-pointer transition-colors duration-200 ${providerStyles[provider]}`}
    >
      {providerNames[provider]}
    </button>
  );
}

function Login() {
  return (
    <div className="min-h-screen flex flex-col gap-8 items-center justify-center bg-mainbg text-textmain font-noto">
      <div className="bg-cardbg rounded-[18px] shadow-md p-9 min-w-[320px] flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-2 text-textmain">Momentree</h2>
        <p className="text-base text-textsub mb-6">
          가득 데이트 마일돌 케어 서비스
        </p>
        <div className="flex flex-col gap-3 w-full">
          <SocialLoginButton provider="google" />
          <SocialLoginButton provider="naver" />
          <SocialLoginButton provider="kakao" />
        </div>
      </div>
    </div>
  );
}

export default Login;
