import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route , Navigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
// import Spam from "./Components/Spam";
import History from "./Components/History";
import Graph from "./Components/Graph";
import SpamGemini from "./Components/SpamGemini";
import LoginWindow from "./Components/LoginWindow";
function AppRouter() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(()=>{
    const auth = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(auth === "true");
  }, []);

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };
  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/home" element={<SpamGemini />} />
        <Route path="/history" element={<History />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/login" element={<LoginWindow />} />
      </Routes>
    </Router>
    
    // <Router>
    //   <Navbar />
    //   <Routes>
    //     <Route path="/" element={<Navigate to="/login" replace/>} />
    //     <Route path="/login" element={<LoginWindow setIsAuthenticated={setIsAuthenticated} />} />
    //     <Route path="/home" element={<ProtectedRoute element={<SpamGemini />} />} />
    //     <Route path="/history" element={<ProtectedRoute element={<History />} />} />
    //     <Route path="/graph" element={<ProtectedRoute element={<Graph />} />} />
    //   </Routes>
    // </Router>
  );
}

export default AppRouter;
