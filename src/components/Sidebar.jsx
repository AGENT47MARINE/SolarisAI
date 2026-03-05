import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, SolarPanel, Monitor, Signal, LogOut } from 'lucide-react';
import './Sidebar.css';

// Custom SVG icons matching Figma
const DashboardIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="1" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="1" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const PanelIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="5" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="1" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" />
        <line x1="1" y1="13" x2="21" y2="13" stroke="currentColor" strokeWidth="1.5" />
        <line x1="8" y1="5" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" />
        <line x1="14" y1="5" x2="14" y2="17" stroke="currentColor" strokeWidth="1.5" />
        <line x1="7" y1="17" x2="7" y2="21" stroke="currentColor" strokeWidth="1.8" />
        <line x1="15" y1="17" x2="15" y2="21" stroke="currentColor" strokeWidth="1.8" />
        <line x1="4" y1="21" x2="18" y2="21" stroke="currentColor" strokeWidth="1.8" />
    </svg>
);

const MonitorIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="2" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <line x1="8" y1="16" x2="8" y2="20" stroke="currentColor" strokeWidth="1.8" />
        <line x1="14" y1="16" x2="14" y2="20" stroke="currentColor" strokeWidth="1.8" />
        <line x1="5" y1="20" x2="17" y2="20" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="11" cy="9" r="3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);

const SignalIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 16C4.7 14.7 4 13 4 11C4 9 4.7 7.3 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M16 6C17.3 7.3 18 9 18 11C18 13 17.3 14.7 16 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M3 19C1.1 17 0 14.1 0 11C0 7.9 1.1 5 3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M19 3C20.9 5 22 7.9 22 11C22 14.1 20.9 17 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const ExportIcon = () => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1" y="1" width="20" height="20" rx="3" stroke="currentColor" strokeWidth="1.8" />
        <polyline points="8,10 12,6 16,10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="6" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="7" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const navItems = [
    { to: '/dashboard', icon: DashboardIcon, tooltip: 'Dashboard' },
    { to: '/inverters', icon: PanelIcon, tooltip: 'Plants' },
    { to: '/sensors', icon: MonitorIcon, tooltip: 'Sensors' },
    { to: '/alerts', icon: SignalIcon, tooltip: 'Alerts' },
    { to: '/map', icon: ExportIcon, tooltip: 'Map' },
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
                {navItems.map(({ to, icon: Icon, tooltip }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}
                        data-tooltip={tooltip}
                    >
                        <Icon />
                    </NavLink>
                ))}
            </nav>

            {/* Logout at bottom */}
            <div className="sidebar-footer">
                <button className="sidebar-nav-item" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <LogOut size={20} />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
