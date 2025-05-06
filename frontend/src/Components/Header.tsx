import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Define interfaces for props
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to: string;
  baseColor: string;  
}

interface HeaderProps {
  userName: string;
  notificationCount: number;
}

// Icon components (simplified)
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const CompassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

// Styled components
const HeaderContainer = styled.header`
  background: linear-gradient(135deg, #c770a0, #a35a79, #854d6d, #6d3f59);
  color: white;
  padding: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
  overflow: hidden;
  width: 100%;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.7), transparent);
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
    pointer-events: none;
  }
`;

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  h1 {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    margin: 0;
  }
  span {
    font-size: 1.25rem;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationBell = styled.div`
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: rgba(255, 255, 255, 0.05);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    
    svg {
      stroke: white;
      transform: rotate(5deg) scale(1.1);
    }
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(0.92);
    box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    opacity: 1;
    transition: all 0.25s ease;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: linear-gradient(to bottom right, #ff5a8d, #f86d96);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  height: 18px;
  width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(248, 109, 150, 0.5);
  border: 1.5px solid rgba(255, 255, 255, 0.7);
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(248, 109, 150, 0.5);
    }
    70% {
      box-shadow: 0 0 0 6px rgba(248, 109, 150, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(248, 109, 150, 0);
    }
  }
`;

const Avatar = styled.div`
  background: linear-gradient(135deg, #9f7afa, #7b68ee, #5d4db8);
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 9999px;
  height: 40px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 8px 16px rgba(91, 77, 184, 0.4);
    background: linear-gradient(135deg, #aa8dfb, #8673f4, #6a5ccb);
    
    &::before {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #8a77fa, #6658c7, #4c42a5);
  }
`;

const Navigation = styled.nav`
  max-width: 1200px;
  margin: 20px auto 0;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
`;

const NavItem = styled.div<{ 
  active?: boolean; 
  baseColor: string;
  isHovered?: boolean; 
  isClicked?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 9999px;
  background-color: ${props => {
    if (props.active) return props.baseColor;
    if (props.isClicked) return props.baseColor.replace(/\d+/, m => Math.max(parseInt(m) - 30, 0).toString());
    if (props.isHovered) return props.baseColor.replace(/\d+/, m => Math.max(parseInt(m) - 20, 0).toString());
    return props.baseColor + 'cc';
  }};
  cursor: pointer;
  color: white;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  box-shadow: ${props => 
    props.isClicked ? 
    'inset 0 2px 5px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.1)' : 
    props.isHovered ? 
    '0 6px 14px rgba(0, 0, 0, 0.25), 0 2px 4px rgba(0, 0, 0, 0.1)' : 
    '0 2px 8px rgba(0, 0, 0, 0.15)'
  };
  transform: ${props => {
    if (props.isClicked) return 'translateY(1px) scale(0.98)';
    if (props.isHovered) return 'translateY(-2px)';
    return 'translateY(0)';
  }};
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${props => props.isHovered ? 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))' : 'none'};
    pointer-events: none;
    opacity: ${props => props.isHovered ? 1 : 0};
    transition: opacity 0.2s ease;
  }
  
  svg {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    padding: 4px;
    transition: all 0.25s ease;
  }

  &:hover svg {
    background-color: rgba(255, 255, 255, 0.3);
    transform: rotate(5deg) scale(1.1);
  }
`;

// NavItem Component with routing and hover/click effects
const NavItemComponent: React.FC<NavItemProps> = ({ icon, label, active = false, to, baseColor }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  const handleMouseDown = () => {
    setIsClicked(true);
  };
  
  const handleMouseUp = () => {
    setTimeout(() => setIsClicked(false), 150);
  };
  
  return (
    <NavItem 
      active={active} 
      baseColor={baseColor}
      isHovered={isHovered}
      isClicked={isClicked}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsClicked(false);
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
        {icon}
        <span>{label}</span>
      </Link>
    </NavItem>
  );
};

const Header: React.FC<HeaderProps> = ({ userName = 'C', notificationCount = 1 }) => {
  // Determine which route is active based on current path
  const currentPath = window.location.pathname;
  
  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo>
          <h1>Ask Asha</h1>
        </Logo>

        <ProfileSection>
          <NotificationBell>
            <BellIcon />
            {notificationCount > 0 && (
              <NotificationBadge>
                {notificationCount}
              </NotificationBadge>
            )}
          </NotificationBell>

          <Avatar>
            {userName}
          </Avatar>
        </ProfileSection>
      </HeaderInner>

      <Navigation>
        <NavItemComponent 
          icon={<BriefcaseIcon />} 
          label="Job Hunt" 
          to="/jobsearch" 
          baseColor="#966FD6" 
          active={currentPath === '/jobsearch'}
        />
        <NavItemComponent 
          icon={<CalendarIcon />} 
          label="Events Hub" 
          to="/events" 
          baseColor="#6395EE" 
          active={currentPath === '/events'}
        />
        <NavItemComponent 
          icon={<MessageCircleIcon />} 
          label="Interview Assistant" 
          to="/interview" 
          baseColor="#FF8547" 
          active={currentPath === '/interview'}
        />
        <NavItemComponent 
          icon={<CompassIcon />} 
          label="Career Coach" 
          to="/chatbot" 
          baseColor="#E85BB1" 
          active={currentPath === '/chatbot' || currentPath === '/'}
        />
        <NavItemComponent 
          icon={<MapIcon />} 
          label="My Roadmap" 
          to="/roadmap" 
          baseColor="#4CAF70" 
          active={currentPath === '/roadmap'}
        />
      </Navigation>
    </HeaderContainer>
  );
};

export default Header;