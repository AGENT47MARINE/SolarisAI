import React, { useState, useEffect } from 'react';
import { Clock, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboardMetrics } from '../data/mockData';

const TopNav = () => {
    const [time, setTime] = useState(new Date());
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="top-nav">
            <div className="top-nav-left">
                {/* Could put breadcrumbs or page titles here, but live site keeps it clean */}
            </div>
            <div className="top-nav-right">
                <div className="clock-widget">
                    <Clock size={16} color="var(--primary)" />
                    {time.toLocaleTimeString()}
                </div>

                <div className="user-profile">
                    <User size={18} />
                    <span>{dashboardMetrics.userName}</span>
                </div>

                <button className="notification-btn" onClick={() => navigate('/alerts')}>
                    <Bell size={16} fill="white" />
                    Alerts
                </button>
            </div>
        </div>
    );
};

export default TopNav;
