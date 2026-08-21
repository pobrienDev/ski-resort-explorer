import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/General/Navbar';
import Home from './components/Pages/Home';
import Resorts from './components/Pages/Resorts';
import ResortDetail from './components/Pages/ResortDetail';
import ResortMap from './components/Pages/ResortMap';
import CSVParseTest from './components/General/CSVParseTest';


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/resorts" element={<Resorts />} />
        <Route path="/resorts/:resortID" element={<ResortDetail />} />
        <Route path="/map" element={<ResortMap />} />
        <Route path="/csv" element={<CSVParseTest />} />
        <Route path="*" element={<Navigate to="/" />} /* ANY INVALID URL GOES HERE */ /> 
      </Routes>
    </Router>
  );
}

export default App;