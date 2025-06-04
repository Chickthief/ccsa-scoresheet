import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pregame/Login';
import Setup from './pregame/SetupInfo';
import AwaySetup from './pregame/AwaySetup';
import HomeSetup from './pregame/HomeSetup';
import Batting from './game/Batting';
import Running from './game/Running';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/setupinfo' element={<Setup />} />
        <Route path='/awaysetup' element={<AwaySetup />} />
        <Route path='/homesetup' element={<HomeSetup />} />
        <Route path='/batting' element={<Batting />} />
        <Route path='/running' element={<Running />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
