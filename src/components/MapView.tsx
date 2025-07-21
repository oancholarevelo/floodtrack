"use client";

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../lib/firebase.js';
import { collection, onSnapshot, addDoc, GeoPoint, Timestamp, serverTimestamp } from 'firebase/firestore';
import ReportFloodModal from './ReportFloodModal';
import { Target } from 'lucide-react';

// Fix for default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

export type FloodLevel = 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';

interface FloodReportDoc {
    id: string;
    level: FloodLevel;
    location: GeoPoint;
    createdAt: Timestamp;
}

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

const createFloodIcon = (color: string) => {
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32px" height="32px" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.5));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/><path d="M12 9.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5m0-2C9.93 7.5 8.5 8.93 8.5 11c0 2.25 3.5 6.5 3.5 6.5s3.5-4.25 3.5-6.5C15.5 8.93 14.07 7.5 12 7.5z" fill="white" fill-opacity="0.5"/></svg>`;
    return L.divIcon({ html: svgIcon, className: 'custom-svg-icon', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] });
};

const floodIcons: Record<FloodLevel, L.Icon | L.DivIcon> = {
    'Ankle-deep': createFloodIcon('#facc15'),
    'Knee-deep': createFloodIcon('#fb923c'),
    'Waist-deep': createFloodIcon('#f87171'),
};

function LocationPicker({ isPicking, onLocationConfirm }: { isPicking: boolean, onLocationConfirm: (latlng: L.LatLng) => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        if (isPicking) {
            setPosition(map.getCenter());
            const onMove = () => setPosition(map.getCenter());
            map.on('move', onMove);
            return () => { map.off('move', onMove); };
        }
    }, [isPicking, map]);

    if (!isPicking || !position) return null;

    return (
        <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
                <Target size={48} className="text-red-500 animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex space-x-2">
                <button
                    onClick={() => onLocationConfirm(position)}
                    className="bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-green-700 transition-colors">
                    Confirm Location
                </button>
            </div>
        </>
    );
}

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
        if (!pickedLocation) {
            alert("Location not selected. Please try again.");
            return;
        }
        const newReport = { level, location: new GeoPoint(pickedLocation.lat, pickedLocation.lng), createdAt: serverTimestamp() };
        try {
            await addDoc(collection(db, 'flood_reports'), newReport);
            setIsModalOpen(false);
            setPickedLocation(null);
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Failed to submit report. Please try again.");
        }
    };

    const formatTimeAgo = (timestamp: Timestamp) => {
        if (!timestamp) return "Just now";
        const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
        if (seconds < 60) return `${seconds} sec ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} min ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hr ago`;
        const days = Math.floor(hours / 24);
        return `${days} day(s) ago`;
    };

    return (
        <div className="h-full w-full relative">
            <MapContainer center={initialPosition} zoom={13} scrollWheelZoom={!isPickingLocation} style={{ height: '100%', width: '100%' }}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {!isPickingLocation && (
                    <>
                        {evacuationCenters.map(center => (
                            <Marker key={center.id} position={center.pos}>
                                <Popup>
                                    <div className="font-bold">{center.name}</div>
                                    <div>Status: <span className="font-semibold text-green-600">{center.status}</span></div>
                                    <div>Capacity: {center.capacity}</div>
                                </Popup>
                            </Marker>
                        ))}
                        {floodReports.map(report => (
                            <Marker key={report.id} position={[report.location.latitude, report.location.longitude]} icon={floodIcons[report.level]}>
                                <Popup>
                                    <div className="font-bold text-lg">{report.level}</div>
                                    <div>Reported: {formatTimeAgo(report.createdAt)}</div>
                                </Popup>
                            </Marker>
                        ))}
                    </>
                )}
                
                <LocationPicker isPicking={isPickingLocation} onLocationConfirm={handleLocationConfirm} />
            </MapContainer>

            {!isPickingLocation && (
                <div className="absolute bottom-4 right-4 z-[1000]">
                     <button onClick={() => setIsPickingLocation(true)} className="bg-blue-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform duration-200 hover:scale-105">
                        Report Flood
                    </button>
                </div>
            )}
            
            {isPickingLocation && (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-black bg-opacity-70 text-white p-2 rounded-lg shadow-lg flex items-center space-x-2">
                    <Target size={16} />
                    <p>Move the map to position the pin.</p>
                </div>
            )}

            <ReportFloodModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleReportSubmit} />
        </div>
    );
}