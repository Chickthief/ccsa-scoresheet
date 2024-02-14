import { team1 } from '../constants'; // Adjust the path as necessary
import Lineup from './components/Lineup';
import Navbar from './components/SetupNavbar';

export default function Team1Setup() {
    return (
        <div className='scoresheet-default'>
            <Navbar />
            <br />
            <h4>Create Lineup for {team1.name}</h4>
            <Lineup team = {team1}></Lineup>
        </div>
    );
}