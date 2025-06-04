import { currentInning, team, away, home, game, homeX, homeY, base1X, base1Y, base2X, base2Y, base3X, base3Y } from "../constants";
import NextPlayers from './gamecomponents/NextPlayers';
import Scoreboard from './gamecomponents/Scoreboard';
import { ReactComponent as DiamondSVG } from "./gamecomponents/diamond.svg"
import { useState } from 'react';

export default function Running() {
    team.base.push(team.players[0]);


    
    return (
        <div className='scoresheet-default'>
            <Scoreboard />
            <NextPlayers />
            <div className="container d-flex">
                <div className="col svg-container">
                    <DiamondSVG style={{ width: '100%', height: 'auto'}}/>
                    <p className="player-overlay-home">{team.players[team.turn].number}</p>
                </div>
                <div className="col">
                    <p>Outs</p>
                    <p>Runs Scored</p>
                </div>
            </div>

            <div className="d-flex justify-content-center">
                {team.base.map((base, index) => (
                    <ButtonColumn key={index} player={base}/>
                ))}
            </div>
        </div>
    );
}

const ButtonColumn = ({ player }) => {
    const [status, setStatus] = useState(''); 
    const [base, setBase] = useState(''); 
  
    // Toggles the status between '', 'safe', and 'out'
    const toggleStatus = (newStatus) => {
        setStatus(currentStatus => currentStatus === newStatus ? '' : newStatus);
    };
  
    // Toggles the base between '', '1B', '2B', '3B', and 'HOME'
    const toggleBase = (newBase) => {
        setBase(currentBase => currentBase === newBase ? '' : newBase);
    };
  
    return (
      <div className="d-flex flex-column" style={{margin:"2%"}}>
        <p>{player.name}< br/>
        {player.number}</p>
        
        <button
          className={`btn ${status === 'safe' ? 'btn-secondary' : 'button-ccsa'}`}
          onClick={() => toggleStatus('safe')}
        >
          Safe
        </button>
        <button
          className={`btn ${status === 'out' ? 'btn-secondary' : 'button-ccsa'}`}
          onClick={() => toggleStatus('out')}
        >
          OUT
        </button>
        <p><br/>at</p>
        {['1B', '2B', '3B', 'HOME'].map((baseOption) => (
          <button
            key={baseOption}
            className={`btn ${base === baseOption ? 'btn-secondary' : 'button-ccsa'}`}
            onClick={() => toggleBase(baseOption)}
          >
            {baseOption}
          </button>
        ))}
      </div>
    );
  };



