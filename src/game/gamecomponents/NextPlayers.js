import { team, away, home, game, currentInning } from '../../constants'

export default function NextPlayers() {
    let displayPrev = true;
    if (team.turn === 0 && currentInning < 2) {
        displayPrev = false;
    }
    return (
        <div className="container d-flex">
            <div className="col-5 text-end">
                <p>
                    {displayPrev && (<br />)}
                    <b>At Bat:</b> <br />
                    Up Next:
                </p>
            </div>
            <div className="col-1" />
            <div className="col-6 text-start">
            {displayPrev && (
                <>
                    <text style={{ color: "lightgrey" }}>{team.players[Math.abs(team.turn - team.players.length + 1)].name}</text>
                    <br />
                </>
            )}
                <b>{team.players[team.turn].name}</b> <br />
                {team.players[team.turn + 1].name} <br />
                {team.players[team.turn + 2].name} <br />
                {team.players[team.turn + 3].name}
            </div>
        </div>
    )
}