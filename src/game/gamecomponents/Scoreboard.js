import { away, home, game, currentInning } from '../../constants';

export default function Scoreboard() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-lightg">
            <h3>{game[currentInning].inning} {game[currentInning].type === 'top' ? '↑' : '↓'}</h3>
            <div className="inning-grid">
                {game.map((inning, index) => {
                    // Calculate row and column number
                    let row = index % 2 + 1;
                    let column = Math.floor(index / 2) + 1;
                    return (
                        <div key={index} className={`inning-box ${index === currentInning ? 'current-inning' : ''}`}
                            style={{gridRow: row, gridColumn: column}}>
                            {inning.type === 'top' ? inning.inning : ''}
                        </div>
                    );
                })}
                <p>{away.score} {away.name}</p>
                <p>{home.score} {home.name}</p>
            </div>
        </nav>
    );
}
