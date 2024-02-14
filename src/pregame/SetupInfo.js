import { useNavigate } from 'react-router-dom';
import { team1, team2, gameDetails } from '../constants'; // Adjust the path as necessary
import Navbar from './components/SetupNavbar';

function StartButton() {
    let navigate = useNavigate();
    const handleClick = () => {
      navigate('/setup'); //change dir
    };
    return (
      <button className='button-ccsa' id='StartButton' onClick={handleClick}>Confirm Lineup and Start Game</button>
    );
  }

export default function Info() {
    return (
      <div className='scoresheet-default'>
          <Navbar />
          <br />
          <h1>{team1.name}</h1>
          <h1>at</h1>
          <h1>{team2.name}</h1>
          <br/>
          <h2>{gameDetails.code}</h2>
          <h2>{gameDetails.date}</h2>
          <h2>{gameDetails.time}</h2>
          <h2>{gameDetails.location}</h2>
          <br />
          <p>{team1.name}: {team1.players} players</p>
          <p>{team2.name}: {team2.players} players</p>
          <StartButton />
      </div>
    );
};