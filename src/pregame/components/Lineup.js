import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { PlayerString } from './PlayerString';

export default function Lineup({team}) {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        setPlayers(team.players);
    }, [team.players]);

    const handleClick = (indexToRemove) => {
        const updatedPlayers = players.filter((_, index) => index !== indexToRemove); //Replace with splice
        setPlayers(updatedPlayers);
    }

    return (
        <>
            {players.map((player, index) => (
                <div className="default-margins d-flex align-items-center mb-2"> 
                    <FontAwesomeIcon className="flex-shrink-1" icon={faSort} aria-hidden="true" />
                    <div className="flex-grow-1 ms-2"> {player.number} </div> 
                    <div className="flex-grow-1 ms-3"> {player.name} </div> 
                    <button className="btn btn-secondary ms-auto" onClick={() => handleClick(index)}>-</button> 
                    <div className="lineup-border" />
                </div>
            ))}
            <PlayerString />
        </>
    );
}