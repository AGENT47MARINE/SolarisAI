import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { invertersData, sensorsData } from '../data/mockData';
import { Server, Activity } from 'lucide-react';
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

const PlantMap = () => {
    // Center at approximate India coordinates to view all states
    const mapCenter = [22.0, 79.0];

    return (
        <div className="view-container animate-fade-in">
            <div className="page-header" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <h1 className="page-title" style={{ color: 'var(--primary-dark)' }}>Live Operations Map</h1>
                <p style={{ color: 'var(--text-muted)' }}>Interactive spatial view of devices across sites</p>
            </div>

            <div className="card" style={{ height: '650px', padding: 0, overflow: 'hidden', position: 'relative' }}>
                <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    {/* Map tiles - OpenStreetMap */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {/* Rendering Inverters */}
                    {invertersData.map((inv, index) => {
                        const baseCoord = getStateCoordinates(inv.location);
                        // Spread the nodes realistically over a small area
                        const offsetLat = index * 0.1 * (index % 2 === 0 ? 1 : -1);
                        const offsetLng = index * 0.1 * (index % 3 === 0 ? 1 : -1);
                        const position = [baseCoord[0] + offsetLat, baseCoord[1] + offsetLng];

                        const icon = createCustomIcon(inv.telemetry.status, 'inverter');

                        return (
                            <Marker key={`inv-${inv.id}`} position={position} icon={icon}>
                                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                                    <strong>{inv.deviceName}</strong><br />
                                    <span style={{ color: 'gray' }}>{inv.location}</span>
                                </Tooltip>
                                <Popup>
                                    <div style={{ minWidth: '150px' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#334155' }}>{inv.deviceName}</h4>
                                        <div style={{ marginBottom: '6px', fontSize: '0.85rem' }}>
                                            Status: <span style={{
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                color: inv.telemetry.status === 'normal' ? 'var(--status-normal)' :
                                                    inv.telemetry.status === 'warning' ? 'var(--status-warning)' : 'var(--status-critical)'
                                            }}>
                                                {inv.telemetry.status}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            Power: <strong>{inv.telemetry.activePower} kW</strong>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Rendering Sensors */}
                    {sensorsData.map((sensor, index) => {
                        // Simulate warning on some sensors
                        const isDown = sensor.deviceName.includes("RADIATION");
                        const status = isDown ? 'warning' : 'normal';

                        const baseCoord = getStateCoordinates(sensor.location);
                        // Spread differently than inverters
                        const offsetLat = (index + 2) * 0.08 * (index % 2 === 0 ? -1 : 1);
                        const offsetLng = (index + 2) * 0.08 * (index % 3 === 0 ? -1 : 1);
                        const position = [baseCoord[0] + offsetLat, baseCoord[1] + offsetLng];

                        const icon = createCustomIcon(status, 'sensor');

                        return (
                            <Marker key={`sen-${sensor.id}`} position={position} icon={icon}>
                                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                                    <strong>{sensor.deviceName || sensor.device_name}</strong><br />
                                    <span style={{ color: 'gray' }}>{sensor.location}</span>
                                </Tooltip>
                                <Popup>
                                    <div style={{ minWidth: '140px' }}>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#334155' }}>{sensor.deviceName || sensor.device_name}</h4>
                                        <div style={{ fontSize: '0.85rem', marginBottom: '4px' }}>
                                            Type: <strong>{sensor.category.toUpperCase()}</strong>
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                                            Mfg: {sensor.manufacturer}
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
