import React, { useState, useEffect } from 'react';
import { Clock, User, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const TopNav = () => {
    const [time, setTime] = useState(new Date());
    const [userName, setUserName] = useState('Loading...');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        apiService.getDashboardMetrics()
            .then(data => {
                // The API doesn't return a username right now, but in a real app it would. 
                // We'll hardcode 'Operator' representing a successful load of system state, 
                // or we could add a user profile endpoint.
                setUserName('Operator');
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch user data for nav:', err);
                setUserName('Guest');
                setLoading(false);
            });
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
                    <span>{userName}</span>
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
