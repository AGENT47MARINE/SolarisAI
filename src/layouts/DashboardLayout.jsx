import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

const DashboardLayout = () => {
    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#F0F4F8' }}>
            <Sidebar />
            <div style={{ marginLeft: '80px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <TopNav />
                <div style={{ flex: 1, overflowY: 'auto', background: '#F0F4F8' }} className="animate-fade-in">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
