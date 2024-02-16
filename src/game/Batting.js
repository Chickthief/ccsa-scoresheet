import { away, home, game, currentInning } from '../constants';
import Scoreboard from './Scoreboard';
import Action from './Action'

export default function Batting() {
    return (
        <div className='scoresheet-default'>
            <Scoreboard />
            <div className='mb-0'>
                <p>At Bat: {away.players[away.turn].name}</p>
                <p>Up Next: {away.players[away.turn + 1].name}</p>
                <p>{away.players[away.turn + 2].name}</p>
                <p>{away.players[away.turn + 3].name}</p>
            </div>
            <Action />
        </div>
    );
}