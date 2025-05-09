import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Schedule from "./pages/schedule/index.jsx";
import Home from "./pages/home/index.jsx";
import Login from "./pages/auth/index.jsx";
import CoupleConnect from "./pages/authCouple/index.jsx";
import OAuth2RedirectHandler from "./pages/auth/OAuthRedirectHandler.jsx"; // OAuth 리다이렉트 핸들러 컴포넌트
import AdditionalInfo from "./pages/authAdditionalInfo/index.jsx"; // 추가 정보 입력 페이지
import MyPage from "./pages/mypage/index.jsx";
import AccountRecovery from "./pages/accountRecovery/index.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route
          path="/login/oauth2/success"
          element={<OAuth2RedirectHandler />}
        />
        <Route path="/additional-info" element={<AdditionalInfo />} />
        <Route path="/connect" element={<CoupleConnect />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/recover" element={<AccountRecovery />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
