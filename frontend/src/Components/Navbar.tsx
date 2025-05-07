import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const navigateToJobSearch = () => {
        localStorage.setItem('viewType', 'jobs');
        navigate('/jobsearch');
    };

    const navigateToEventHub = () => {
        // Clear any existing chat history to make it appear as a new feature
        localStorage.removeItem('chatHistory');
        localStorage.setItem('viewType', 'events');
        navigate('/jobsearch');
    };

    const navigateToRoadmap = () => {
        // Clear any existing chat history to make it appear as a new feature
        localStorage.removeItem('chatHistory');
        localStorage.setItem('viewType', 'roadmap');
        navigate('/jobsearch');
    };

    const navigateToInterviewAssistant = () => {
        navigate('/interview-assistant');
    };

    const navigateToCareerCoach = () => {
        navigate('/career-coach');
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/')}>AskAsha</div>
            <div className="navbar-links">
                <button onClick={navigateToJobSearch} className="navbar-link">Job Hunt</button>
                <button onClick={navigateToEventHub} className="navbar-link">Event Hub</button>
                <button onClick={navigateToRoadmap} className="navbar-link">My Roadmap</button>
                <button onClick={navigateToInterviewAssistant} className="navbar-link">Interview Assistant</button>
                <button onClick={navigateToCareerCoach} className="navbar-link">Career Coach-Help Desk</button>
                {/* <button onClick={() => navigate('/profile')} className="navbar-link">Profile</button> */}
                <button className="navbar-logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
