import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { ArrowLeft, Loader2, Server, Activity } from 'lucide-react';

const PlantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [plant, setPlant] = useState(null);
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlantData = async () => {
            try {
                const [plantData, allDevices] = await Promise.all([
                    apiService.getPlant(id),
                    apiService.getDevices()
                ]);

                setPlant(plantData);
                // Filter devices by plant_id - ensuring strict string comparison for ID
                const plantDevices = allDevices.filter(d =>
                    String(d.plant_id) === String(id)
                );
                setDevices(plantDevices);
                console.log(`Plant ID: ${id}, Devices Found: ${plantDevices.length}`);
            } catch (err) {
                console.error("Failed to fetch plant details", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlantData();
    }, [id]);

    if (loading) {
        return (
            <div className="view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <Loader2 className="spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    if (!plant) {
        return <div className="view-container">Plant not found</div>;
    }

    return (
        <div className="view-container animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={() => {
                        if (window.history.length > 2) {
                            navigate(-1);
                        } else {
                            navigate('/plants');
                        }
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="page-title" style={{ color: 'var(--text-heading)', margin: 0 }}>{plant.name}</h1>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        Location: {plant.location || 'Site A'} | Status: {plant.status}
                    </span>
                </div>
            </div>

            <div className="grid-3" style={{ marginBottom: '2rem' }}>
                <div className="card">
                    <div className="card-label">Today's Generation</div>
                    <div className="card-value">{plant.today_gen} <span className="card-unit">kWh</span></div>
                </div>
                <div className="card">
                    <div className="card-label">Total Generation</div>
                    <div className="card-value">{plant.total_gen} <span className="card-unit">MWh</span></div>
                </div>
                <div className="card">
                    <div className="card-label">Active Devices</div>
                    <div className="card-value">{devices.length} <span className="card-unit">/ {plant.device_count}</span></div>
                </div>
            </div>

            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Monitored Devices</h2>
            <div className="card" style={{ padding: 0 }}>
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
                        {devices.map(device => (
                            <tr
                                key={device.id}
                                onClick={() => navigate(`/inverters/${device.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td style={{ fontWeight: 600 }}>{device.device_name}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {device.category === 'inverter' ? <Server size={16} /> : <Activity size={16} />}
                                        <span className={`tag ${device.category}`}>{device.category}</span>
                                    </div>
                                </td>
                                <td>{device.manufacturer}</td>
                                <td>
                                    <span className={`status-badge ${device.status}`}>
                                        {device.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PlantDetails;
