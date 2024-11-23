import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Nav from './pages/Nav';
import Admin from './pages/admin';
import UserTest from './pages/usertest'; // Correct path for usertest component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Nav" element={<Nav />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/usertest" element={<UserTest />} /> {/* Correct path for usertest */}
      </Routes>
    </Router>
  );
}

export default App;
 