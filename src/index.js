import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pregame/Login';
import Setup from './pregame/SetupInfo';
import Team1Setup from './pregame/Team1Setup';
import Team2Setup from './pregame/Team2Setup';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/setup' element={<Setup />} />
        <Route path='/team1setup' element={<Team1Setup />} />
        <Route path='/team2setup' element={<Team2Setup />} />
      </Routes>
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
