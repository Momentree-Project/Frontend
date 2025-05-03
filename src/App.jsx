import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Schedule from './pages/schedule/index.jsx'
import Home from './pages/home/index.jsx';
import Login from './pages/auth/index.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/schedule" element={<Schedule />} />
                <Route path='/' element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
