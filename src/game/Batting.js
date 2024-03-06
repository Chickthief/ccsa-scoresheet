import NextPlayers from './gamecomponents/NextPlayers';
import Scoreboard from './gamecomponents/Scoreboard';
import Action from './gamecomponents/Action';

export default function Batting() {
    return (
        <div className='scoresheet-default'>
            <Scoreboard />
            <NextPlayers />
            <Action />
        </div>
    );
}