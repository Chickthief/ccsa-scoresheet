import { ReactComponent as DiamondSVG } from "./diamond.svg"
import React, { useState, useRef } from "react"

export default function Action() {
  const [lineEnd, setLineEnd] = useState({ x: 0, y: 0 });
  const [click, setClick] = useState(false);
  const [activeButton, setActiveButton] = useState(null); // Track the active button
  const svgContainerRef = useRef(null);

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
      <DiamondSVG style={{ width: '100%', height: 'auto'}}/>
      {click && (
        <svg className="overlay-svg">
          <line x1="50%" y1="95%" x2={`${lineEnd.x}px`} y2={`${lineEnd.y}px`} stroke="red" strokeWidth="5"/>
          <circle cx={`${lineEnd.x}px`} cy={`${lineEnd.y}px`} r="10" fill="yellow" />
        </svg>
      )}
    </div>
    <br />
    <button className='btn btn-primary'>Confirm Batting Outcome</button>
  </>

  );  
}