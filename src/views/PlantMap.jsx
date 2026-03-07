import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import apiService from '../services/apiService';
import { Server, Activity, Loader2 } from 'lucide-react';
import { renderToString } from 'react-dom/server';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to render Lucide React icons into HTML strings for Leaflet divIcons
const createCustomIcon = (status, type) => {
    let color = 'var(--status-normal)';
    if (status === 'warning') color = 'var(--status-warning)';
    if (status === 'critical') color = 'var(--status-critical)';

    const iconHtml = renderToString(
        <div style={{
            backgroundColor: color,
            color: 'white',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
            border: '2px solid white'
        }}>
            {type === 'inverter' ? <Server size={18} /> : <Activity size={18} />}
        </div>
    );

    return L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16],
    });
};

const getStateCoordinates = (location) => {
    if (!location) return [20.59, 78.96]; // Default India center
    const loc = location.toLowerCase();
    if (loc.includes('gujarat')) return [23.16, 72.82];
    if (loc.includes('rajasthan')) return [27.53, 71.91];
    if (loc.includes('tamil nadu')) return [9.35, 78.40];
    if (loc.includes('madhya pradesh')) return [24.48, 81.56];
    if (loc.includes('karnataka')) return [14.10, 77.27];
    return [20.59, 78.96]; // Default India center
};

const PlantMap = ({ statusData }) => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(!statusData);

    useEffect(() => {
        if (statusData) return; // Use data from props if available (dashboard view)

        const fetchDevices = async () => {
            try {
                const data = await apiService.getDevices();
                setDevices(data);
                setLoading(false);
            } catch (err) {
                console.error("Map data fetch error:", err);
                setLoading(false);
            }
        };
        fetchDevices();
    }, [statusData]);

    const mapCenter = [22.0, 79.0];

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
            <Loader2 className="animate-spin" size={48} color="var(--primary)" />
        </div>
    );

    const displayDevices = statusData ? [] : devices;

    return (
        <div className={statusData ? "dashboard-map-container" : "view-container animate-fade-in"}>
            {!statusData && (
                <div className="page-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <h1 className="page-title" style={{ color: 'var(--primary-dark)' }}>Live Operations Map</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Interactive spatial view of devices across sites</p>
                </div>
            )}

            <div className="card" style={{ height: statusData ? '100%' : '650px', padding: 0, overflow: 'hidden', position: 'relative' }}>
                <MapContainer center={mapCenter} zoom={statusData ? 4 : 5} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {displayDevices.map((dev, index) => {
                        // Use real coordinates if provided by API, otherwise fallback
                        let position = [0, 0];
                        if (dev.lat && dev.lng) {
                            position = [dev.lat, dev.lng];
                            // Add a tiny random offset to distinguish multiple devices at same plant
                            position[0] += (index * 0.0001) - 0.0005;
                            position[1] += (index * 0.0001) - 0.0005;
                        } else {
                            const baseCoord = getStateCoordinates(dev.location);
                            const offsetLat = (index % 10) * 0.1 * (index % 2 === 0 ? 1 : -1);
                            const offsetLng = (index % 10) * 0.1 * (index % 3 === 0 ? 1 : -1);
                            position = [baseCoord[0] + offsetLat, baseCoord[1] + offsetLng];
                        }

                        const icon = createCustomIcon(dev.status, 'inverter');

                        return (
                            <Marker key={dev.id} position={position} icon={icon}>
                                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                                    <strong>{dev.device_name}</strong><br />
                                    <span style={{ color: 'gray' }}>{dev.location}</span>
                                </Tooltip>
                                <Popup>
                                    <div style={{ minWidth: '150px' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#334155' }}>{dev.device_name}</h4>
                                        <div style={{ marginBottom: '6px', fontSize: '0.85rem' }}>
                                            Status: <span style={{
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                color: dev.status === 'active' || dev.status === 'normal' ? 'var(--status-normal)' :
                                                    dev.status === 'warning' ? 'var(--status-warning)' : 'var(--status-critical)'
                                            }}>
                                                {dev.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            Current Gen: <strong>{(dev.today_gen || 0).toFixed(1)} kWh</strong>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>

                {/* Map Legend Overlay */}
                <div style={{
                    position: 'absolute', top: '20px', right: '20px',
                    background: 'rgba(255, 255, 255, 0.95)', padding: '16px',
                    borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                    zIndex: 1000, border: '1px solid #e2e8f0',
                    backdropFilter: 'blur(8px)'
                }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', color: '#0F172A' }}>Device Health</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '10px', color: '#334155' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--status-normal)', flexShrink: 0 }}></div> Normal Ops
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '10px', color: '#334155' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--status-warning)', flexShrink: 0 }}></div> Warning / Degraded
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--status-critical)', flexShrink: 0 }}></div> Fault / Offline
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlantMap;
