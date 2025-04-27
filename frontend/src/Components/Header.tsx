import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
  // Add Link from react-router-dom

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


// Styled components (no change)
const HeaderContainer = styled.header`
  background-color: #8a4a6f;
  color: white;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  gap: 8px;
`;

const NotificationBell = styled.div`
  position: relative;
  cursor: pointer;
  svg {
    opacity: 0.8;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ec4899;
  color: white;
  font-size: 0.75rem;
  border-radius: 9999px;
  height: 16px;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Avatar = styled.div`
  background-color: #ec4899;
  border-radius: 9999px;
  height: 32px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
`;

const Navigation = styled.nav`
  max-width: 1200px;
  margin: 16px auto 0;
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 8px;
  background-color: #8a4a6f;
`;

const NavLink = styled(Link)`
  color: white; /* or any other color you prefer */
  text-decoration: none; /* remove underline */

  &:hover {
    color: #ec4899; /* hover color */
  }
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 9999px;
  background-color: ${props => props.active ? '#9c4dcc' : 'rgba(241, 241, 241, 0.1)'};
  cursor: pointer;
  color: white;
  transition: background-color 0.2s;
  white-space: nowrap;
  
  &:hover {
    background-color:rgb(245, 241, 247);
  }

  svg {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    padding: 4px;
  }
`;

// NavItem Component with routing
const NavItemComponent: React.FC<NavItemProps> = ({ icon, label, active = false, to }) => {
  return (
    <NavItem active={active}>
      <Link to={to} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'inherit' }}>
        {icon}
        <span>{label}</span>
      </Link>
    </NavItem>
  );
};

const Header: React.FC<HeaderProps> = ({ userName = 'C', notificationCount = 1 }) => {
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
            {userName.charAt(0)}
          </Avatar>
        </ProfileSection>
      </HeaderInner>

      <Navigation>
        <NavItemComponent icon={<BriefcaseIcon />} label="Job Hunt" to="/jobsearch" />
        <NavItemComponent icon={<CalendarIcon />} label="Events Hub" to="/jobsearch" />
        <NavItemComponent icon={<MessageCircleIcon />} label="Interview Assistant" to="/askasha" />
        <NavItemComponent icon={<CompassIcon />} label="Career Coach" to="/askasha" />
        <NavItemComponent icon={<MapIcon />} label="My Roadmap" to="/jobsearch" />
      </Navigation>
    </HeaderContainer>
  );
};

export default Header;
