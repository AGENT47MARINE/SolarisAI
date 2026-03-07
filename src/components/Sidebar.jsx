import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import './Sidebar.css';

// Higher fidelity SVG icons matching Figma
const DashboardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="9" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="2" width="9" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="2" y="13" width="9" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="13" width="9" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const PanelIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="2" y1="9" x2="22" y2="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="2" y1="13" x2="22" y2="13" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8.5" y1="5" x2="8.5" y2="17" stroke="currentColor" strokeWidth="1.5" />
        <line x1="15.5" y1="5" x2="15.5" y2="17" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="17" x2="8" y2="21" stroke="currentColor" strokeWidth="1.8" />
        <line x1="16" y1="17" x2="16" y2="21" stroke="currentColor" strokeWidth="1.8" />
        <line x1="5" y1="21" x2="19" y2="21" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const MonitorIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <line x1="9" y1="17" x2="9" y2="21" stroke="currentColor" strokeWidth="1.8" />
        <line x1="15" y1="17" x2="15" y2="21" stroke="currentColor" strokeWidth="1.8" />
        <line x1="6" y1="21" x2="18" y2="21" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const SignalIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M7 17C5.7 15.7 5 14 5 12C5 10 5.7 8.3 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M17 7C18.3 8.3 19 10 19 12C19 14 18.3 15.7 17 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 20C2.1 18 1 15.1 1 12C1 8.9 2.1 6 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M20 4C21.9 6 23 8.9 23 12C23 15.1 21.9 18 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const ExportIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <polyline points="9,11 12,7 15,11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="8" y1="19" x2="16" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const navItems = [
    { to: '/dashboard', icon: DashboardIcon, tooltip: 'Dashboard', label: 'Home' },
    { to: '/inverters', icon: PanelIcon, tooltip: 'Plants', label: 'Plants' },
    { to: '/sensors', icon: MonitorIcon, tooltip: 'Sensors', label: 'Sensors' },
    { to: '/alerts', icon: SignalIcon, tooltip: 'Alerts', label: 'Alerts' },
    { to: '/map', icon: ExportIcon, tooltip: 'Export Data', label: 'Export' },
];

const Sidebar = () => {
    return (
        <div className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <span className="logo-d">D</span>
                <span className="logo-star">✦</span>
            </div>

            {/* Nav Links */}
            <nav className="sidebar-nav">
                {navItems.map(({ to, icon: Icon, tooltip, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                        data-tooltip={tooltip}
                    >
                        <Icon />
                        <span className="nav-label">{label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Logout at bottom */}
            <div className="sidebar-footer">
                <NavLink to="/login" className="sidebar-nav-item logout-btn" data-tooltip="Logout" onClick={() => localStorage.removeItem('isAuthenticated')}>
                    <LogOut size={24} />
                    <span className="nav-label">Logout</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
