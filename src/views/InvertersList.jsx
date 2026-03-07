import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { Search, Server, Activity, Loader2 } from 'lucide-react';
import './InvertersList.css';

const InvertersList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchDevices = async () => {
            try {
                const data = await apiService.getDevices();
                setDevices(data);
                setLoading(false);
            } catch (err) {
                console.error("Device fetch error:", err);
                setLoading(false);
            }
        };
        fetchDevices();
    }, []);

    const filtered = devices.filter(inv =>
        inv.device_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="inverters-view animate-fade-in">
            <div className="inv-header-row">
                <h1 className="inv-title">
                    Inverters <span className="inv-count">({filtered.length})</span>
                </h1>

                <div className="inv-controls">
                    <div className="inv-search">
                        <Search className="inv-search-icon" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or brand..."
                            className="inv-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="inv-table-card">
                <table className="inv-table">
                    <thead>
                        <tr>
                            <th>Device Details</th>
                            <th>Category</th>
                            <th>Manufacturer</th>
                            <th>Total Generation</th>
                            <th>Today's Generation</th>
                            <th>Last Connected</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(device => (
                            <tr key={device.id} onClick={() => navigate(`/inverters/${device.id}`)}>
                                <td>
                                    <div className="inv-name">
                                        {device.category === 'inverter' ? (
                                            <Server size={16} className="inv-name-icon" />
                                        ) : (
                                            <Activity size={16} className="inv-name-icon" />
                                        )}
                                        {device.device_name}
                                    </div>
                                </td>
                                <td>
                                    <span className={`tag ${device.category}`}>{device.category}</span>
                                </td>
                                <td>{device.manufacturer}</td>
                                <td>
                                    <span className="inv-val highlight">
                                        {device.total_gen?.toFixed(1) || '0.0'} kWh
                                    </span>
                                </td>
                                <td>
                                    <span className="inv-val success">
                                        {device.today_gen?.toFixed(2) || '0.00'} kWh
                                    </span>
                                </td>
                                <td>
                                    <span className="inv-date">Just now</span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No devices match your search criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvertersList;
