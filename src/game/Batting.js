import { away, home, game, currentInning } from '../constants';
import Scoreboard from './Scoreboard';
import Action from './Action';

export default function Batting() {
    return (
        <div className='scoresheet-default'>
            <Scoreboard />
            <p>
                At Bat: {away.players[away.turn].name} <br />
                Up Next: {away.players[away.turn + 1].name} <br />
                {away.players[away.turn + 2].name} <br />
                {away.players[away.turn + 3].name}
            </p>
            <Action />
            
        </div>
    );
}