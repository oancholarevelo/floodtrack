"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, GeoPoint, Timestamp, query, where } from 'firebase/firestore';
import { Siren, ShieldCheck, MapPin, Users, Activity, Edit, Trash2, Eye, Clock, Navigation } from 'lucide-react';
import UpdateSafeAreaModal from './UpdateSafeAreaModal';
import UpdateFloodReportModal from './UpdateFloodReportModal';

export interface FloodReportDoc {
    id: string;
    level: 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';
    location: GeoPoint;
    status: 'active' | 'subsided';
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    distance?: number;
}

export interface EvacuationCenterDoc {
    id: string;
    name: string;
    location: GeoPoint;
    capacity?: number;
    status?: 'Open' | 'Full' | 'Closed';
    createdAt: Timestamp;
    distance?: number;
}

interface ListViewProps {
    location: string;
    onViewOnMap: (coords: { lat: number; lng: number }) => void;
    userLocation: { lat: number; lng: number } | null;
}

// Haversine formula to calculate distance between two lat/lng points in kilometers
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'montalban': { lat: 14.7739, lng: 121.1390 },
  'sanmateo': { lat: 14.6939, lng: 121.1169 },
  'marikina': { lat: 14.6331, lng: 121.0993 },
};


export default function ListView({ location, onViewOnMap, userLocation }: ListViewProps) {
    const [floodReports, setFloodReports] = useState<FloodReportDoc[]>([]);
    const [safeAreas, setSafeAreas] = useState<EvacuationCenterDoc[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isFloodUpdateModalOpen, setIsFloodUpdateModalOpen] = useState(false);
    const [selectedSafeArea, setSelectedSafeArea] = useState<EvacuationCenterDoc | null>(null);
    const [selectedFloodReport, setSelectedFloodReport] = useState<FloodReportDoc | null>(null);

    useEffect(() => {
        const center = userLocation || locationCoordinates[location.toLowerCase()] || locationCoordinates['montalban'];

        const floodQuery = query(collection(db, 'flood_reports'), where('status', '==', 'active'));
        const unsubscribeFloods = onSnapshot(floodQuery, (snapshot) => {
            const reports = snapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() } as FloodReportDoc;
                const distance = getDistance(center.lat, center.lng, data.location.latitude, data.location.longitude);
                return { ...data, distance };
            });
            reports.sort((a, b) => a.distance - b.distance);
            setFloodReports(reports);
        });

        const unsubscribeCenters = onSnapshot(collection(db, 'evacuation_centers'), (snapshot) => {
            const centers = snapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() } as EvacuationCenterDoc;
                const distance = getDistance(center.lat, center.lng, data.location.latitude, data.location.longitude);
                return { ...data, distance };
            });
            centers.sort((a, b) => a.distance - b.distance);
            setSafeAreas(centers);
        });

        return () => {
            unsubscribeFloods();
            unsubscribeCenters();
        };
    }, [location, userLocation]);

    const handleDeleteFloodReport = async (id: string) => {
        if (window.confirm("Are you sure you want to permanently delete this flood report?")) {
            await deleteDoc(doc(db, 'flood_reports', id));
        }
    };

    const handleDeleteSafeArea = async (id: string) => {
        if (window.confirm("Are you sure you want to permanently remove this safe area?")) {
            await deleteDoc(doc(db, 'evacuation_centers', id));
        }
    };

    const handleOpenUpdateModal = (safeArea: EvacuationCenterDoc) => {
        setSelectedSafeArea(safeArea);
        setIsUpdateModalOpen(true);
    };

    const handleOpenFloodUpdateModal = (report: FloodReportDoc) => {
        setSelectedFloodReport(report);
        setIsFloodUpdateModalOpen(true);
    };

    const formatTimeAgo = (timestamp: Timestamp) => {
        if (!timestamp) return "a moment ago";
        const seconds = Math.floor((new Date().getTime() - timestamp.toDate().getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="p-4 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <Siren className="mr-3 text-red-500" size={28}/> Active Flood Reports
                </h2>
                <div className="space-y-4">
                    {floodReports.length > 0 ? floodReports.map(report => (
                        <div key={report.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-md transition-all hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                                        report.level === 'Ankle-deep' ? 'bg-yellow-100 text-yellow-800' :
                                        report.level === 'Knee-deep' ? 'bg-orange-100 text-orange-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>{report.level}</span>
                                    <div className="text-xs text-slate-500 flex items-center mt-2">
                                        <MapPin size={12} className="mr-1.5" />
                                        <span>Lat: {report.location.latitude.toFixed(4)}, Lon: {report.location.longitude.toFixed(4)}</span>
                                        {report.distance !== undefined && (
                                            <span className="ml-2 font-semibold text-cyan-700 flex items-center">
                                                <Navigation size={12} className="mr-1"/>
                                                {`~${report.distance.toFixed(1)} km away`}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center mt-1">
                                        <Clock size={12} className="mr-1.5" />
                                        <span>
                                            {report.updatedAt ? `Updated ${formatTimeAgo(report.updatedAt)}` : `Reported ${formatTimeAgo(report.createdAt)}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                                     <button onClick={() => onViewOnMap({ lat: report.location.latitude, lng: report.location.longitude })} className="text-cyan-600 hover:text-cyan-800 p-2 rounded-full hover:bg-cyan-50 transition-colors">
                                        <Eye size={18} />
                                     </button>
                                     <button onClick={() => handleOpenFloodUpdateModal(report)} className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                        <Edit size={18} />
                                     </button>
                                     <button onClick={() => handleDeleteFloodReport(report.id)} className="text-red-500 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors">
                                        <Trash2 size={18} />
                                     </button>
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-sm text-slate-500 p-6 text-center bg-slate-50 rounded-lg border border-dashed">No active flood reports.</p>}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                    <ShieldCheck className="mr-3 text-green-500" size={28}/> Available Safe Areas
                </h2>
                <div className="space-y-4">
                     {safeAreas.length > 0 ? safeAreas.map(area => (
                        <div key={area.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-md transition-all hover:shadow-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex-grow">
                                    <p className="font-bold text-lg text-slate-800">{area.name}</p>
                                     {area.distance !== undefined && (
                                        <div className="text-xs font-semibold text-cyan-700 flex items-center mt-1">
                                            <Navigation size={12} className="mr-1"/>
                                            {`~${area.distance.toFixed(1)} km away`}
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-600">
                                        <span className="flex items-center"><Activity size={14} className="mr-1.5 text-slate-400" /> Status: <span className="font-semibold ml-1">{area.status}</span></span>
                                        <span className="flex items-center"><Users size={14} className="mr-1.5 text-slate-400" /> Capacity: <span className="font-semibold ml-1">{area.capacity || 'N/A'}</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                                     <button onClick={() => onViewOnMap({ lat: area.location.latitude, lng: area.location.longitude })} className="text-cyan-600 hover:text-cyan-800 p-2 rounded-full hover:bg-cyan-50 transition-colors">
                                        <Eye size={18} />
                                     </button>
                                     <button onClick={() => handleOpenUpdateModal(area)} className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors">
                                        <Edit size={18} />
                                     </button>
                                     <button onClick={() => handleDeleteSafeArea(area.id)} className="text-red-500 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors">
                                        <Trash2 size={18} />
                                     </button>
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-sm text-slate-500 p-6 text-center bg-slate-50 rounded-lg border border-dashed">No safe areas listed.</p>}
                </div>
            </div>

            {selectedSafeArea && (
                <UpdateSafeAreaModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    safeArea={selectedSafeArea}
                />
            )}
            
            {selectedFloodReport && (
                <UpdateFloodReportModal
                    isOpen={isFloodUpdateModalOpen}
                    onClose={() => setIsFloodUpdateModalOpen(false)}
                    report={selectedFloodReport}
                />
            )}
        </div>
    );
}