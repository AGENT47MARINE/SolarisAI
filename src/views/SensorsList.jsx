import React from 'react';
import { sensorsData } from '../data/mockData';

const SensorsList = () => {
    return (
        <div className="view-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="page-title" style={{ color: 'var(--primary-dark)' }}>Sensors ({sensorsData.length})</h1>

                {/* Toggle Pills mimicking live site */}
                <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '4px', borderRadius: '24px', border: '1px solid #cbd5e1' }}>
                    <button style={{ border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', borderRadius: '20px', padding: '6px 20px', fontWeight: 500 }}>All</button>
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', padding: '6px 20px', fontWeight: 500 }}>WMS</button>
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', padding: '6px 20px', fontWeight: 500 }}>MFM</button>
                    <button style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', padding: '6px 20px', fontWeight: 500 }}>Temperature</button>
                </div>
            </div>

            <div className="card" style={{ padding: '0' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>Category</th>
                            <th>Manufacturer</th>
                            <th>Created on</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sensorsData.map(sensor => (
                            <tr key={sensor.id}>
                                <td style={{ fontWeight: 500 }}>{sensor.deviceName}</td>
                                <td><span className={`tag ${sensor.category}`}>{sensor.category}</span></td>
                                <td><span style={{ color: 'var(--text-muted)' }}>{sensor.manufacturer}</span></td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{sensor.createdOn}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SensorsList;
