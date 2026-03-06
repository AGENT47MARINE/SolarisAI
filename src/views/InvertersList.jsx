import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Search, Loader2 } from 'lucide-react';

const InvertersList = () => {
    const navigate = useNavigate();
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        apiService.getDevices()
            .then(data => {
                setDevices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch inverters:', err);
                setLoading(false);
            });
    }, []);

    const filteredDevices = devices.filter(d =>
        d.device_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="view-container animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ color: 'var(--primary-dark)' }}>
                    Inverters ({filteredDevices.length})
                </h1>

                <div style={{ position: 'relative', width: '300px' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }}>
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search inverters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 38px',
                            borderRadius: '20px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                            color: 'var(--text-main)',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>Category</th>
                            <th>Manufacturer</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDevices.map(device => (
                            <tr key={device.id} onClick={() => navigate(`/inverters/${device.id}`)} style={{ cursor: 'pointer' }}>
                                <td style={{ fontWeight: 500 }}>{device.device_name}</td>
                                <td><span className={`tag ${device.category}`}>{device.category}</span></td>
                                <td>{device.manufacturer}</td>
                                <td>
                                    <span className={`status-badge ${device.status}`}>
                                        {device.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredDevices.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    No inverters found.
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
