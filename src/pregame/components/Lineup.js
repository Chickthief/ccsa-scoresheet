export default function Lineup({team}) {
    return (
        <>
            <h1>{team.name}</h1>
            <h1>{team.players[0].number}</h1>
            <h1>{team.players.length}</h1>
        </>
    );
}