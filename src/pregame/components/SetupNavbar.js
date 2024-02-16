import { away, home } from '../../constants';

export default function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light navbar-padding">
            <div className="container d-flex flex-nowrap align-items-center justify-content-between">
                <a className="navbar-brand navbar-brand-width">Setup</a>
                <div className="d-flex align-items-center justify-content-evenly">
                    <a className="nav-item nav-link mx-2" href="/setupinfo">Info</a>
                    <a className="nav-item nav-link mx-2" href="/awaysetup">{away.name}</a>
                    <a className="nav-item nav-link mx-2" href="/homesetup">{home.name}</a>
                </div>
            </div>
        </nav>
    );
}
