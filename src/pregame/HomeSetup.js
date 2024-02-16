import { home } from '../constants'; // Adjust the path as necessary
import Lineup from './components/Lineup';
import Navbar from './components/SetupNavbar';

export default function HomeSetup() {
    return (
        <div className='scoresheet-default'>
            <Navbar />
            <br />
            <h4>Create Lineup for {home.name}</h4>
            <Lineup team = {home}></Lineup>
        </div>
    );
}