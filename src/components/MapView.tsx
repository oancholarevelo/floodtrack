"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../lib/firebase.js';
import { collection, onSnapshot, addDoc, GeoPoint, Timestamp, serverTimestamp } from 'firebase/firestore';
import ReportFloodModal from './ReportFloodModal';
import { Target, X, Check, ShieldCheck, Siren } from 'lucide-react';

// Fix for default marker icon issue (this part is important and remains)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

export type FloodLevel = 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';

interface FloodReportDoc {
    id: string;
    level: FloodLevel;
    location: GeoPoint;
    createdAt: Timestamp;
}

// --- Redesigned Icons ---

const createFloodIcon = (level: FloodLevel) => {
    const colors: Record<FloodLevel, string> = {
        'Ankle-deep': '#facc15', // yellow-400
        'Knee-deep': '#fb923c', // orange-400
        'Waist-deep': '#f87171', // red-400
    };
    const color = colors[level];
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="40px" height="40px" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" fill-opacity="0.7"/></svg>`;
    return L.divIcon({ html: svgIcon, className: 'custom-flood-icon', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });
};

const evacuationCenterIcon = L.divIcon({
    html: `<div style="background-color: #16a34a; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>`,
    className: 'custom-evacuation-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

// --- Redesigned Location Picker ---

function LocationPicker({ isPicking, onLocationConfirm, onCancel }: { isPicking: boolean, onLocationConfirm: (latlng: L.LatLng) => void, onCancel: () => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        if (isPicking) {
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            setPosition(map.getCenter());
            const onMove = () => setPosition(map.getCenter());
            map.on('move', onMove);
            return () => { map.off('move', onMove); };
        }
    }, [isPicking, map]);

    if (!isPicking || !position) return null;

    return (
        <>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white bg-opacity-90 text-slate-800 p-2 rounded-full shadow-lg flex items-center space-x-2 text-sm font-semibold">
                <Target size={16} className="text-cyan-600"/>
                <p>Move map to pin the flood location</p>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
                <Target size={48} className="text-red-500 drop-shadow-lg" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex space-x-4">
                 <button
                    onClick={onCancel}
                    className="bg-white text-slate-700 font-bold p-4 rounded-full shadow-lg hover:bg-slate-100 transition-colors flex items-center">
                    <X size={20} />
                </button>
                <button
                    onClick={() => onLocationConfirm(position)}
                    className="bg-cyan-600 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2">
                    <Check size={20} />
                    <span>Confirm Location</span>
                </button>
            </div>
        </>
    );
}

// --- Main Map View Component ---

export default function MapView() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPickingLocation, setIsPickingLocation] = useState(false);
    const [pickedLocation, setPickedLocation] = useState<L.LatLng | null>(null);
    const [floodReports, setFloodReports] = useState<FloodReportDoc[]>([]);
    
    const initialPosition: L.LatLngExpression = [14.7739, 121.1390];

    const evacuationCenters = useMemo(() => [
        { id: 1, name: "Rodriguez Municipal Hall", pos: [14.7739, 121.1390] as L.LatLngExpression, capacity: 200, status: "Open" },
        { id: 2, name: "Kasiglahan Village Elem. School", pos: [14.7583, 121.1486] as L.LatLngExpression, capacity: 400, status: "Open" },
    ], []);

    useEffect(() => {
        const reportsCollection = collection(db, 'flood_reports');
        const unsubscribe = onSnapshot(reportsCollection, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FloodReportDoc));
            setFloodReports(reportsData);
        });
        return () => unsubscribe();
    }, []);

    const handleLocationConfirm = (latlng: L.LatLng) => {
        setPickedLocation(latlng);
        setIsPickingLocation(false);
        setIsModalOpen(true);
    };
    
    const handleReportSubmit = async (level: FloodLevel) => {
        if (!pickedLocation) return;
        const newReport = { level, location: new GeoPoint(pickedLocation.lat, pickedLocation.lng), createdAt: serverTimestamp() };
        await addDoc(collection(db, 'flood_reports'), newReport);
        setIsModalOpen(false);
        setPickedLocation(null);
    };

    const formatTimeAgo = (timestamp: Timestamp) => {
        if (!timestamp) return "Just now";
        const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    return (
        <div className="h-full w-full relative">
            <MapContainer center={initialPosition} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                
                {/* --- Markers --- */}
                {evacuationCenters.map(center => (
                    <Marker key={center.id} position={center.pos} icon={evacuationCenterIcon}>
                        <Popup>
                            <div className="font-bold text-md text-slate-800 flex items-center"><ShieldCheck size={18} className="mr-2 text-green-600"/>{center.name}</div>
                            <div className="mt-2 space-y-1">
                                <div>Status: <span className="font-semibold text-green-600">{center.status}</span></div>
                                <div>Capacity: {center.capacity}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
                {floodReports.map(report => (
                    <Marker key={report.id} position={[report.location.latitude, report.location.longitude]} icon={createFloodIcon(report.level)}>
                        <Popup>
                            <div className="font-bold text-lg">{report.level}</div>
                            <div className="text-slate-500">Reported: {formatTimeAgo(report.createdAt)}</div>
                        </Popup>
                    </Marker>
                ))}
                
                <LocationPicker isPicking={isPickingLocation} onLocationConfirm={handleLocationConfirm} onCancel={() => setIsPickingLocation(false)} />
            </MapContainer>

            {!isPickingLocation && (
                <div className="absolute bottom-4 right-4 z-[1000]">
                     <button onClick={() => setIsPickingLocation(true)} className="bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:bg-red-700 transition-transform duration-200 hover:scale-105 flex items-center space-x-2">
                        <Siren size={20}/>
                        <span>Report Flood</span>
                    </button>
                </div>
            )}

            <ReportFloodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleReportSubmit} />
        </div>
    );
}