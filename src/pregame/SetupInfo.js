import { useNavigate } from 'react-router-dom';
import { away, home, gameDetails } from '../constants'; // Adjust the path as necessary
import Navbar from './components/SetupNavbar';

function StartButton() {
    let navigate = useNavigate();
    const handleClick = () => {
      navigate('/batting'); //change dir
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
          <h1>{away.name}</h1>
          <h1>at</h1>
          <h1>{home.name}</h1>
          <br/>
          <h2>{gameDetails.code}</h2>
          <h2>{gameDetails.date}</h2>
          <h2>{gameDetails.time}</h2>
          <h2>{gameDetails.location}</h2>
          <br />
          <p>{away.name}: {away.players.length} players</p>
          <p>{home.name}: {home.players.length} players</p>
          <StartButton />
      </div>
    );
};