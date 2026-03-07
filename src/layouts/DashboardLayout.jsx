import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';
import Breadcrumbs from '../components/Breadcrumbs';

const DashboardLayout = () => {
    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg-main)' }}>
            <Sidebar />

            {/* Main Content Area - Shifted Right to account for 90px Sidebar */}
            <div style={{ marginLeft: '90px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TopNav />

                {/* Scrollable Container with Glassmorphic styling padding */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    background: 'var(--bg-main)',
                    padding: '0 2rem 2rem 2rem'
                }} className="animate-fade-in">

                    {/* Global Breadcrumbs Area */}
                    <Breadcrumbs />

                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
