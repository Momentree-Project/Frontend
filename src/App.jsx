import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Schedule from './pages/schedule/index.jsx'
import Home from './pages/home/index.jsx';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/schedule" element={<Schedule />} />
            </Routes>
        </Router>
    );
}

export default App;
