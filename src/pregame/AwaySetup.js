import { away } from '../constants'; // Adjust the path as necessary
import Lineup from './components/Lineup';
import Navbar from './components/SetupNavbar';

export default function AwaySetup() {
    return (
        <div className='scoresheet-default'>
            <Navbar />
            <br />
            <h4>Create Lineup for {away.name}</h4>
            <Lineup team = {away}></Lineup>
        </div>
    );
}