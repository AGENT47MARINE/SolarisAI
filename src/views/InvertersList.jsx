import React from 'react';
import { useNavigate } from 'react-router-dom';
import { invertersData } from '../data/mockData';
import { Search } from 'lucide-react';

const InvertersList = () => {
    const navigate = useNavigate();

    return (
        <div className="view-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ color: 'var(--primary-dark)' }}>Inverters ({invertersData.length})</h1>

                <div style={{ position: 'relative', width: '300px' }}>
                    <div style={{ position: 'absolute', top: '10px', left: '12px', color: 'var(--text-muted)' }}>
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search inverters..."
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
                            <th>Total Generation</th>
                            <th>Today Generation</th>
                            <th>Created on</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invertersData.map(device => (
                            <tr key={device.id} onClick={() => navigate(`/inverters/${device.id}`)}>
                                <td style={{ fontWeight: 500 }}>{device.deviceName}</td>
                                <td><span className="tag inverter">{device.category}</span></td>
                                <td>{device.manufacturer}</td>
                                <td className="text-success">{device.totalGeneration.toFixed(2)} KWH</td>
                                <td className="text-success">{device.todayGeneration.toFixed(2)} KWH</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{device.createdOn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvertersList;
