import React, { useState, useRef } from "react"
import { useNavigate } from 'react-router-dom';
import { currentInning, away, home, game } from "../constants";

export default function Action() {
  const [lineEnd, setLineEnd] = useState({ x: 0, y: 0 });
  const [click, setClick] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // Track the active button
  const svgContainerRef = useRef(null);

  const [homeX, homeY] = [236, 401];
  const [base1X, base1Y] = [343, 294];
  const [base2X, base2Y] = [128, 294];
  const [base3X, base3Y] = [236, 186];


  let team;
  if (game[currentInning].type === "top") {
    team = away;
  }

  let navigate = useNavigate();
  const confirmOutcome = () => {
    if (click) {
      navigate('/running');
    }
    
  };

  const handleClick = (event) => {
    if (activeButton !== null && svgContainerRef.current && svgContainerRef.current.contains(event.target)) {
      const rect = svgContainerRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left; // x position within the element.
      const y = event.clientY - rect.top;  // y position within the element.
      setLineEnd({ x, y });
      setClick(true);
    }
  };
  
  const toggleActive = (buttonId) => {
    setActiveButton(current => current === buttonId ? null : buttonId);
    setClick(false);
  };


  const buttonClass = (buttonId) => 
    `btn btn-secondary button-ccsa btn-action ${activeButton === buttonId ? 'active' : ''}`;

  return (
    <>
      <div className="container p-0 fs-2">
        <div className="row">
          <div className="col-md-4">
            <button onClick={() => toggleActive(1)} type="button" className={buttonClass(1)}>Fly hit to</button>
          </div>
          <div className="col-md-4">
            <button onClick={() => toggleActive(2)} type="button" className={buttonClass(2)}>Line drive to</button>
          </div>
          <div className="col-md-4">
            <button onClick={() => toggleActive(3)} type="button" className={buttonClass(3)}>Grounder to</button>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <button onClick={() => toggleActive(4)} type="button" className={buttonClass(4)}>Caught OUT</button>
          </div>
          <div className="col-md-4">
            <button onClick={() => toggleActive(5)} type="button" className={buttonClass(5)}>Strike OUT</button>
          </div>
          <div className="col-md-4">
            <button onClick={() => toggleActive(6)} type="button" className={buttonClass(6)}>More...</button>
          </div>
        </div>
      </div>

    <div className='svg-container' onClick={handleClick} ref={svgContainerRef}>
      <svg style={{ width: '100%', height: 'auto'}} width="472" height="415" viewBox="0 0 472 413" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M357.823 280.73L235.805 172.329L113.722 280.789L0.71875 180.396C10.1314 165.178 22.096 150.872 36.6125 137.976L86.5533 93.6082C169.13 20.2468 303.012 20.2469 385.588 93.6083L435.529 137.976C449.925 150.765 461.811 164.94 471.187 180.017L357.823 280.73Z" fill="#98DF8A"/>
        <path fill-rule="evenodd" clip-rule="evenodd" d="M328.482 306.061L235.875 225.139L143.218 306.106L63 236.009C72.1394 216.707 85.687 198.624 103.643 182.933C176.782 119.022 295.364 119.022 368.503 182.933C386.363 198.541 399.863 216.516 409 235.702L328.482 306.061Z" fill="#b69f66"/>
        <rect x="235.848" y="189.541" width="147.497" height="147.497" transform="rotate(45 235.848 189.541)" fill="#b69f66" stroke="black" stroke-width="4.40722"/>
        <circle cx={base1X} cy={base1Y} r="12" fill="white" stroke-width="2" stroke="black"/>
        <circle cx={base2X} cy={base2Y} r="12" fill="white" stroke-width="2" stroke="black"/>
        <circle cx={homeX} cy={homeY} r="12" fill="white" stroke-width="2" stroke="black"/>
        <circle cx={base3X} cy={base3Y} r="12" fill="white" stroke-width="2" stroke="black"/>
      </svg>
      <h3 className="overlay-svg">{team.players[team.turn].name}</h3>
      {click && (
        <svg className="overlay-svg">
          <line x1="50%" y1="95%" x2={`${lineEnd.x}px`} y2={`${lineEnd.y}px`} stroke="red" strokeWidth="5"/>
          <circle cx={`${lineEnd.x}px`} cy={`${lineEnd.y}px`} r="10" fill="yellow" />
        </svg>
      )}
    </div>
    <br />
    <button className='btn btn-primary' onClick={confirmOutcome}>Confirm Batting Outcome</button>
  </>

  );  
}