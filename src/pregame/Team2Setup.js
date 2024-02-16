import { team2 } from '../constants'; // Adjust the path as necessary
import Lineup from './components/Lineup';
import Navbar from './components/SetupNavbar';

export default function Team2Setup() {
    return (
        <div className='scoresheet-default'>
            <Navbar />
            <br />
            <h4>Create Lineup for {team2.name}</h4>
            <Lineup team = {team2}></Lineup>
        </div>
    );
}