import { team1, team2, game, currentInning } from '../constants';
import Scoreboard from './Scoreboard';

export default function Batting() {
    return (
        <div className='scoresheet-default'>
            <Scoreboard />
            <h1>{game[currentInning].inning}</h1>
            <h1>{game[currentInning].type}</h1>
        </div>
    );
}