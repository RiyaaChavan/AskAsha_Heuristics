import { useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
    
    const navigateToProfile = () => {
        setShowProfileDropdown(false);
        navigate('/profile');
    };
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowProfileDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar-logo" onClick={() => navigate('/')}>AskAsha</div>
            <div className="navbar-links">
                <button onClick={navigateToJobSearch} className="navbar-link">Job Hunt</button>
                {/* <button onClick={navigateToEventHub} className="navbar-link">Event Hub</button>
                <button onClick={navigateToRoadmap} className="navbar-link">My Roadmap</button> */}
                <button onClick={navigateToInterviewAssistant} className="navbar-link">Interview Assistant</button>                <button onClick={navigateToCareerCoach} className="navbar-link">Career Coach-Help Desk</button>
                <div className="profile-icon-wrapper" ref={dropdownRef}>
                    <img 
                        src="/profile-icon.svg" 
                        alt="Profile" 
                        className="profile-icon" 
                        onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                        title="Profile Options"
                    />
                    {showProfileDropdown && (
                        <div className="profile-dropdown">
                            <div className="dropdown-item" onClick={navigateToProfile}>
                                <i className="fas fa-user"></i> My Profile
                            </div>
                            <div className="dropdown-item" onClick={handleLogout}>
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
