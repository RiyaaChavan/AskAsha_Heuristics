import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/')}>AskAsha</div>
            <div className="navbar-links">
                <button onClick={() => navigate('/jobsearch')} className="navbar-link">Job Search</button>
                <button onClick={() => navigate('/interview')} className="navbar-link">Interview</button>
                {/* <button onClick={() => navigate('/profile')} className="navbar-link">Profile</button> */}
                <button className="navbar-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
