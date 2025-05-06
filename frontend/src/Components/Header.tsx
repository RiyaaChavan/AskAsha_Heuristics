import styled from 'styled-components';
import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';

// Define interfaces for props
interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  to: string;
}

interface HeaderProps {
  userName: string;
  notificationCount: number;
  onLogout: () => void; // Added onLogout prop
}

// Icon components
const BriefcaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const MessageCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const CompassIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

const MapIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
    <line x1="8" y1="2" x2="8" y2="18"></line>
    <line x1="16" y1="6" x2="16" y2="22"></line>
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

// Styled components with reduced font sizes
const HeaderContainer = styled.header`
  background-color: #8a4a6f;
  color: white;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 56px;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 12px;
  
  @media (max-width: 640px) {
    gap: 6px;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 100px;
  h1 {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    margin: 0;
  }
  
  @media (max-width: 640px) {
    min-width: 70px;
    h1 {
      font-size: 0.875rem;
    }
  }
`;

const Navigation = styled.nav`
  display: flex;
  gap: 12px;
  align-items: center;
  overflow-x: auto;
  flex-grow: 1;
  justify-content: center;
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 640px) {
    gap: 6px;
    justify-content: flex-start;
  }
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 9999px;
  background-color: ${props => props.active ? '#9c4dcc' : 'rgba(241, 241, 241, 0.1)'};
  cursor: pointer;
  color: white;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  font-size: 0.75rem;
  
  &:hover {
    background-color: #9c4dcc;
    transform: translateY(-1px);
  }

  svg {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    padding: 3px;
  }
  
  @media (max-width: 640px) {
    padding: 3px 6px;
    font-size: 0.7rem;
    
    svg {
      width: 14px;
      height: 14px;
      padding: 2px;
    }
  }
`;

const StyledLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  
  @media (max-width: 640px) {
    gap: 3px;
  }
`;

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 40px;
  
  @media (max-width: 640px) {
    min-width: 30px;
  }
`;

const Avatar = styled.div`
  background-color: rgb(135, 192, 90);
  border-radius: 9999px;
  height: 28px;
  width: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  font-size: 0.75rem;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }
  
  @media (max-width: 640px) {
    height: 24px;
    width: 24px;
    font-size: 0.7rem;
  }
`;

// User dropdown menu styles
const MenuButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const DropdownItems = styled.div`
  position: absolute;
  right: 0;
  mt-2 w-48 py-1;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  z-index: 10;
  min-width: 150px;
  margin-top: 0.5rem;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  font-size: 0.875rem;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

// NavItem Component
const NavItemComponent: React.FC<NavItemProps> = ({ icon, label, active = false, to }) => {
  return (
    <NavItem active={active}>
      <StyledLink to={to}>
        {icon}
        <span>{label}</span>
      </StyledLink>
    </NavItem>
  );
};

// Header Component
const Header: React.FC<HeaderProps> = ({ userName = 'C', notificationCount = 1, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <HeaderInner>
        <Logo>
          <h1>Ask Asha</h1>
        </Logo>

        <Navigation>
          <NavItemComponent icon={<BriefcaseIcon />} label="Job Hunt" to="/jobsearch" />
          <NavItemComponent icon={<CalendarIcon />} label="Events Hub" to="/events" />
          <NavItemComponent icon={<MessageCircleIcon />} label="Interview Assistant" to="/askasha" />
          <NavItemComponent icon={<CompassIcon />} label="Career Coach" to="/career" />
          <NavItemComponent icon={<MapIcon />} label="My Roadmap" to="/roadmap" />
        </Navigation>

        <ProfileSection>
          <Menu as="div" className="relative">
            <Menu.Button as={MenuButton}>
              <Avatar>
                {userName.charAt(0)}
              </Avatar>
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items as={DropdownItems}>
                <Menu.Item>
                  {({ active }) => (
                    <MenuItem onClick={() => navigate('/profile')}>
                      Profile
                    </MenuItem>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <MenuItem onClick={() => navigate('/settings')}>
                      Settings
                    </MenuItem>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon />
                      Logout
                    </MenuItem>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </ProfileSection>
      </HeaderInner>
    </HeaderContainer>
  );
};

export default Header;