// src/components/ListView.tsx

"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, GeoPoint, Timestamp, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { Siren, ShieldCheck, MapPin, Users, Activity, Edit, Trash2, Eye, Clock, Navigation, AlertTriangle } from 'lucide-react';
import UpdateSafeAreaModal from './UpdateSafeAreaModal';
import UpdateFloodReportModal from './UpdateFloodReportModal';

export interface FloodReportDoc {
    id: string;
    level: 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';
    location: GeoPoint;
    status: 'active' | 'subsided' | 'pending_deletion';
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    distance?: number;
}

export interface EvacuationCenterDoc {
    id: string;
    name: string;
    location: GeoPoint;
    capacity?: number;
    status?: 'Open' | 'Full' | 'Closed' | 'pending_deletion';
    createdAt: Timestamp;
    updatedAt?: Timestamp;
    distance?: number;
}

interface ListViewProps {
    location: string;
    onViewOnMap: (coords: { lat: number; lng: number }) => void;
    userLocation: { lat: number; lng: number } | null;
}

type ListTab = 'reports' | 'safeAreas';

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const locationCoordinates: { [key: string]: { lat: number; lng: number } } = {
  'montalban': { lat: 14.7739, lng: 121.1390 },
  'sanmateo': { lat: 14.6939, lng: 121.1169 },
  'marikina': { lat: 14.6331, lng: 121.0993 },
};

export default function ListView({ location, onViewOnMap, userLocation }: ListViewProps) {
    const [activeTab, setActiveTab] = useState<ListTab>('reports');
    const [floodReports, setFloodReports] = useState<FloodReportDoc[]>([]);
    const [safeAreas, setSafeAreas] = useState<EvacuationCenterDoc[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isFloodUpdateModalOpen, setIsFloodUpdateModalOpen] = useState(false);
    const [selectedSafeArea, setSelectedSafeArea] = useState<EvacuationCenterDoc | null>(null);
    const [selectedFloodReport, setSelectedFloodReport] = useState<FloodReportDoc | null>(null);

    useEffect(() => {
        const center = userLocation || locationCoordinates[location.toLowerCase()] || locationCoordinates['montalban'];
        const twoDaysAgo = Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));

        const cleanupStaleItems = async (collectionName: string, statusField: string, validStatuses: string[]) => {
            const q = query(
                collection(db, collectionName),
                where(statusField, 'in', validStatuses)
            );
            const snapshot = await getDocs(q);
            const batch = writeBatch(db);
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const lastUpdated = data.updatedAt || data.createdAt;
                if (lastUpdated && lastUpdated < twoDaysAgo) {
                    batch.update(doc.ref, { status: 'pending_deletion' });
                }
            });
            if (!snapshot.empty) {
                await batch.commit();
            }
        };

        const setupListeners = () => {
            cleanupStaleItems('flood_reports', 'status', ['active']);
            cleanupStaleItems('evacuation_centers', 'status', ['Open', 'Full', 'Closed']);

            const floodQuery = query(collection(db, 'flood_reports'), where('status', 'in', ['active', 'pending_deletion']));
            const unsubscribeFloods = onSnapshot(floodQuery, (snapshot) => {
                const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), distance: getDistance(center.lat, center.lng, doc.data().location.latitude, doc.data().location.longitude) } as FloodReportDoc));
                reports.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
                setFloodReports(reports);
            });

            const safeAreasQuery = query(collection(db, 'evacuation_centers'));
            const unsubscribeCenters = onSnapshot(safeAreasQuery, (snapshot) => {
                const centers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), distance: getDistance(center.lat, center.lng, doc.data().location.latitude, doc.data().location.longitude) } as EvacuationCenterDoc));
                centers.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
                setSafeAreas(centers);
            });

            return { unsubscribeFloods, unsubscribeCenters };
        };

        const { unsubscribeFloods, unsubscribeCenters } = setupListeners();

        return () => {
            unsubscribeFloods();
            unsubscribeCenters();
        };
    }, [location, userLocation]);

    const handleRequestDeletion = async (collectionName: string, id: string) => {
        if (window.confirm("Are you sure you want to request deletion for this item? An admin will review this request.")) {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, { status: 'pending_deletion' });
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

    const TabButton = ({ tab, label, icon }: { tab: ListTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-1/2 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${activeTab === tab ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const DeletionBanner = () => (
        <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-md flex items-center">
            <AlertTriangle size={14} className="mr-2" />
            Pending Deletion
        </div>
    );

    return (
        <div className="h-full w-full flex flex-col relative">
            <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="flex bg-slate-100 rounded-full p-1 mb-4">
                    <TabButton tab="reports" label="Flood Reports" icon={<Siren size={16} />} />
                    <TabButton tab="safeAreas" label="Safe Areas" icon={<ShieldCheck size={16} />} />
                </div>
            </div>

            <div className="flex-grow p-4 pb-24">
                {activeTab === 'reports' && (
                    <div className="space-y-4">
                        {floodReports.length > 0 ? floodReports.map(report => (
                            <div key={report.id} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-md transition-all hover:shadow-lg ${report.status === 'pending_deletion' ? 'opacity-60' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow min-w-0">
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
                                         {report.status === 'pending_deletion' && <DeletionBanner />}
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                                        <button onClick={() => onViewOnMap({ lat: report.location.latitude, lng: report.location.longitude })} className="text-cyan-600 hover:text-cyan-800 p-2 rounded-full hover:bg-cyan-50 transition-colors">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleOpenFloodUpdateModal(report)} className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors" disabled={report.status === 'pending_deletion'}>
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleRequestDeletion('flood_reports', report.id)} className="text-red-500 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors" disabled={report.status === 'pending_deletion'}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 p-6 text-center bg-slate-50 rounded-lg border border-dashed">No active flood reports.</p>}
                    </div>
                )}
                {activeTab === 'safeAreas' && (
                    <div className="space-y-4">
                        {safeAreas.length > 0 ? safeAreas.map(area => (
                            <div key={area.id} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-md transition-all hover:shadow-lg ${area.status === 'pending_deletion' ? 'opacity-60' : ''}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow min-w-0">
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
                                         {area.status === 'pending_deletion' && <DeletionBanner />}
                                    </div>
                                    <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                                        <button onClick={() => onViewOnMap({ lat: area.location.latitude, lng: area.location.longitude })} className="text-cyan-600 hover:text-cyan-800 p-2 rounded-full hover:bg-cyan-50 transition-colors">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleOpenUpdateModal(area)} className="text-slate-500 hover:text-slate-800 p-2 rounded-full hover:bg-slate-100 transition-colors" disabled={area.status === 'pending_deletion'}>
                                            <Edit size={18} />
                                        </button>
                                        <button onClick={() => handleRequestDeletion('evacuation_centers', area.id)} className="text-red-500 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors" disabled={area.status === 'pending_deletion'}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : <p className="text-sm text-slate-500 p-6 text-center bg-slate-50 rounded-lg border border-dashed">No safe areas listed.</p>}
                    </div>
                )}
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