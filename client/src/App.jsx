import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/General/Navbar';
import Home from './components/Pages/Home';
import Resorts from './components/Pages/Resorts';
import ResortDetail from './components/Pages/ResortDetail';
import CSVParseTest from './components/General/CSVParseTest';
import './App.css';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resorts" element={<Resorts />} />
        <Route path="/resorts/:resortID" element={<ResortDetail />} />
        <Route path="/csv" element={<CSVParseTest />} />
        <Route path="*" element={<Navigate to="/" />} /* ANY INVALID URL GOES HERE */ /> 
      </Routes>
    </Router>
  );
}

export default App;