import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSort } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

export default function Lineup({team}) {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        setPlayers(team.players);
    }, [team.players]);

    const handleClick = (indexToRemove) => {
        const updatedPlayers = players.filter((_, index) => index !== indexToRemove);
        setPlayers(updatedPlayers);
    }

    return (
        <>
            {players.map((player, index) => (
                <div className="d-flex align-items-center mb-2" key={index}> 
                    <FontAwesomeIcon className="lineup-box small" icon={faSort} aria-hidden="true" />
                    <p className="lineup-box me-2 mb-0"> {player.number} </p> 
                    <p className="lineup-box me-3 mb-0"> {player.name} </p> 
                    <button className="button-ccsa btn btn-primary" onClick={() => handleClick(index)}>-</button> 
                </div>
            ))}
        </>
    );
}