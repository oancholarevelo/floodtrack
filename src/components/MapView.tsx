"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from '../lib/firebase.js';
import { collection, onSnapshot, addDoc, GeoPoint, Timestamp, serverTimestamp, query, where } from 'firebase/firestore';
import ReportFloodModal from './ReportFloodModal';
import AddSafeAreaModal, { SafeAreaData } from './AddSafeAreaModal';
import { Target, X, Check, ShieldCheck, Siren, ShieldPlus, LocateFixed } from 'lucide-react';

// Fix for default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
});

export type FloodLevel = 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';
type PickingMode = 'flood' | 'safe_area' | null;

interface FloodReportDoc {
    id: string;
    level: FloodLevel;
    location: GeoPoint;
    createdAt: Timestamp;
}

interface EvacuationCenterDoc {
    id:string;
    name: string;
    location: GeoPoint;
    capacity?: number;
    status?: string;
    createdAt: Timestamp;
}

const createFloodIcon = (level: FloodLevel) => {
    const colors: Record<FloodLevel, string> = {
        'Ankle-deep': '#facc15', 'Knee-deep': '#fb923c', 'Waist-deep': '#f87171',
    };
    const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colors[level]}" width="40px" height="40px" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" fill-opacity="0.7"/></svg>`;
    return L.divIcon({ html: svgIcon, className: 'custom-flood-icon', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });
};

const evacuationCenterIcon = L.divIcon({
    html: `<div style="background-color: #16a34a; width: 32px; height: 32px; border-radius: 50%; display: flex; justify-content: center; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3); border: 2px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg></div>`,
    className: 'custom-evacuation-icon', iconSize: [32, 32], iconAnchor: [16, 16],
});


// --- UPDATED LocateControl COMPONENT ---
function LocateControl() {
    const map = useMap();

    useEffect(() => {
        // This function runs when the location is successfully found
        const onLocationFound = (e: L.LocationEvent) => {
            // You can optionally add a marker here if you want
            // L.marker(e.latlng).addTo(map).bindPopup("You are here!").openPopup();
        };

        // This function runs if location access fails or is denied
        const onLocationError = (e: L.ErrorEvent) => {
            console.error("Location error:", e.message);
            alert("Location access denied or unavailable. Please check your browser settings and ensure location services are enabled.");
        };

        // Set up the event listeners on the map instance
        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        // Clean up the listeners when the component is removed
        return () => {
            map.off('locationfound', onLocationFound);
            map.off('locationerror', onLocationError);
        };
    }, [map]);

    const handleLocate = () => {
        // Now, the button simply tells the map to find the location.
        // setView: true automatically pans the map to the user's location.
        map.locate({ setView: true, maxZoom: 16 });
    };

    return (
        <div className="leaflet-top leaflet-left">
            <div className="leaflet-control leaflet-bar">
                <a href="#" title="Locate me" role="button" onClick={(e) => { e.preventDefault(); handleLocate(); }}>
                    <LocateFixed size={18} style={{ margin: '6px' }} />
                </a>
            </div>
        </div>
    );
}
// --- END OF UPDATED LocateControl COMPONENT ---


function LocationPicker({ isPicking, onLocationConfirm, onCancel }: { isPicking: boolean, onLocationConfirm: (latlng: L.LatLng) => void, onCancel: () => void }) {
    const [position, setPosition] = useState<L.LatLng | null>(null);
    const map = useMap();

    useEffect(() => {
        if (isPicking) {
            map.dragging.enable(); map.scrollWheelZoom.enable();
            setPosition(map.getCenter());
            const onMove = () => setPosition(map.getCenter());
            map.on('move', onMove);
            return () => { map.off('move', onMove); };
        }
    }, [isPicking, map]);

    if (!isPicking || !position) return null;

    return (
        <>
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[2001] bg-white bg-opacity-90 text-slate-800 p-2 rounded-full shadow-lg flex items-center space-x-2 text-sm font-semibold">
                <Target size={16} className="text-cyan-600"/>
                <p>Move map to pin the location</p>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none">
                <Target size={48} className="text-red-500 drop-shadow-lg" />
            </div>
            <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[2001] flex space-x-4">
                <button onClick={onCancel} className="bg-white text-slate-700 font-bold p-4 rounded-full shadow-lg hover:bg-slate-100 transition-colors"> <X size={20} /> </button>
                <button onClick={() => onLocationConfirm(position)} className="bg-cyan-600 text-white font-bold py-4 px-6 rounded-full shadow-lg hover:bg-cyan-700 transition-colors flex items-center space-x-2"> <Check size={20} /> <span>Confirm Location</span> </button>
            </div>
        </>
    );
}

const locationCoordinates: { [key: string]: [number, number] } = {
  'montalban': [14.7739, 121.1390],
  'sanmateo': [14.6939, 121.1169],
};

interface MapViewProps {
    location: string;
    mapCenter?: { lat: number; lng: number };
    onEditFromMap: () => void;
}

const MapFocusController = ({ center }: { center?: { lat: number, lng: number }}) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 15);
        }
    }, [center, map]);
    return null;
};

export default function MapView({ location, mapCenter, onEditFromMap }: MapViewProps) {
    const [pickingMode, setPickingMode] = useState<PickingMode>(null);
    const [pickedLocation, setPickedLocation] = useState<L.LatLng | null>(null);
    const [isFloodModalOpen, setIsFloodModalOpen] = useState(false);
    const [isSafeAreaModalOpen, setIsSafeAreaModalOpen] = useState(false);
    const [floodReports, setFloodReports] = useState<FloodReportDoc[]>([]);
    const [evacuationCenters, setEvacuationCenters] = useState<EvacuationCenterDoc[]>([]);

    const initialPosition: L.LatLngExpression = locationCoordinates[location.toLowerCase()] || [14.7739, 121.1390];

    useEffect(() => {
        const reportsQuery = query(collection(db, 'flood_reports'), where('status', '==', 'active'));
        const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
            const reportsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FloodReportDoc));
            setFloodReports(reportsData);
        });

        const centersCollection = collection(db, 'evacuation_centers');
        const unsubCenters = onSnapshot(centersCollection, (snapshot) => {
            const centersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvacuationCenterDoc));
            setEvacuationCenters(centersData);
        });

        return () => {
            unsubReports();
            unsubCenters();
        };
    }, []);

    const handleLocationConfirm = (latlng: L.LatLng) => {
        setPickedLocation(latlng);
        if (pickingMode === 'flood') setIsFloodModalOpen(true);
        if (pickingMode === 'safe_area') setIsSafeAreaModalOpen(true);
        setPickingMode(null);
    };
    
    const handleFloodReportSubmit = async (level: FloodLevel, status: 'active') => {
        if (!pickedLocation) return;
        await addDoc(collection(db, 'flood_reports'), { 
            level, 
            status,
            location: new GeoPoint(pickedLocation.lat, pickedLocation.lng), 
            createdAt: serverTimestamp() 
        });
        setIsFloodModalOpen(false);
        setPickedLocation(null);
    };

    const handleSafeAreaSubmit = async (data: SafeAreaData) => {
        if (!pickedLocation) return;
        await addDoc(collection(db, 'evacuation_centers'), { ...data, location: new GeoPoint(pickedLocation.lat, pickedLocation.lng), createdAt: serverTimestamp() });
        setIsSafeAreaModalOpen(false);
        setPickedLocation(null);
    };

    const formatTimeAgo = (timestamp: Timestamp) => {
        if (!timestamp) return "Just now";
        const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
        let interval = Math.floor(seconds / 60);
        if (interval < 60) return interval + " minutes ago";
        interval = Math.floor(interval / 60);
        if (interval < 24) return interval + " hours ago";
        interval = Math.floor(interval / 24);
        return interval + " days ago";
    };

    return (
        <div className="h-full w-full relative">
            <MapContainer center={mapCenter || initialPosition} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                
                <MapFocusController center={mapCenter} />

                {evacuationCenters.map(center => (
                    <Marker key={center.id} position={[center.location.latitude, center.location.longitude]} icon={evacuationCenterIcon}>
                        <Popup>
                            <div className="font-bold text-md text-slate-800 flex items-center"><ShieldCheck size={18} className="mr-2 text-green-600"/>{center.name}</div>
                            <div className="mt-2 space-y-1">
                                <div>Status: <span className="font-semibold text-green-600">{center.status || 'N/A'}</span></div>
                                <div>Capacity: {center.capacity || 'N/A'}</div>
                            </div>
                            <button onClick={onEditFromMap} className="w-full mt-2 text-sm text-cyan-600 font-semibold p-2 rounded-lg hover:bg-cyan-50">Edit Details</button>
                        </Popup>
                    </Marker>
                ))}
                {floodReports.map(report => (
                    <Marker key={report.id} position={[report.location.latitude, report.location.longitude]} icon={createFloodIcon(report.level)}>
                        <Popup>
                            <div className="font-bold text-lg">{report.level}</div>
                            <div className="text-slate-500">Reported: {formatTimeAgo(report.createdAt)}</div>
                            <button onClick={onEditFromMap} className="w-full mt-2 text-sm text-cyan-600 font-semibold p-2 rounded-lg hover:bg-cyan-50">Edit Details</button>
                        </Popup>
                    </Marker>
                ))}
                
                <LocationPicker isPicking={pickingMode !== null} onLocationConfirm={handleLocationConfirm} onCancel={() => setPickingMode(null)} />
                <LocateControl />
            </MapContainer>

            {pickingMode === null && (
                <div className="fixed bottom-24 right-4 z-[2001] flex flex-col space-y-3">
                    <button onClick={() => setPickingMode('safe_area')} className="bg-green-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:bg-green-700 transition-transform duration-200 hover:scale-105 flex items-center space-x-2">
                        <ShieldPlus size={20}/>
                        <span>Add Safe Area</span>
                    </button>
                    <button onClick={() => setPickingMode('flood')} className="bg-red-600 text-white font-bold py-3 px-4 rounded-full shadow-lg hover:bg-red-700 transition-transform duration-200 hover:scale-105 flex items-center space-x-2">
                        <Siren size={20}/>
                        <span>Report Flood</span>
                    </button>
                </div>
            )}

            <ReportFloodModal 
                isOpen={isFloodModalOpen} 
                onClose={() => setIsFloodModalOpen(false)} 
                onSubmit={handleFloodReportSubmit} 
            />
            <AddSafeAreaModal isOpen={isSafeAreaModalOpen} onClose={() => setIsSafeAreaModalOpen(false)} onSubmit={handleSafeAreaSubmit} />
        </div>
    );
}