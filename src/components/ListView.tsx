"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, GeoPoint, Timestamp, query, where } from 'firebase/firestore';
import { Siren, ShieldCheck, MapPin, Users, Activity, Edit, Trash2, XCircle } from 'lucide-react';
import UpdateSafeAreaModal from './UpdateSafeAreaModal';

// Re-using types for consistency
interface FloodReportDoc {
    id: string;
    level: 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';
    location: GeoPoint;
    status: 'active' | 'subsided';
    createdAt: Timestamp;
}

interface EvacuationCenterDoc {
    id: string;
    name: string;
    location: GeoPoint;
    capacity?: number;
    status?: 'Open' | 'Full' | 'Closed';
    createdAt: Timestamp;
}

export default function ListView({ location }: { location: string }) {
    const [floodReports, setFloodReports] = useState<FloodReportDoc[]>([]);
    const [safeAreas, setSafeAreas] = useState<EvacuationCenterDoc[]>([]);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedSafeArea, setSelectedSafeArea] = useState<EvacuationCenterDoc | null>(null);

    useEffect(() => {
        // Listener for active flood reports
        const floodQuery = query(collection(db, 'flood_reports'), where('status', '==', 'active'));
        const unsubFloods = onSnapshot(floodQuery, (snapshot) => {
            const reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FloodReportDoc));
            setFloodReports(reports);
        });

        // Listener for evacuation centers
        const unsubCenters = onSnapshot(collection(db, 'evacuation_centers'), (snapshot) => {
            const centers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvacuationCenterDoc));
            setSafeAreas(centers);
        });

        return () => {
            unsubFloods();
            unsubCenters();
        };
    }, []);

    const handleMarkAsSubsided = async (id: string) => {
        if (window.confirm("Are you sure this flood has subsided? This will remove it from the active list and map.")) {
            const reportRef = doc(db, 'flood_reports', id);
            await updateDoc(reportRef, { status: 'subsided' });
        }
    };

    const handleDeleteSafeArea = async (id: string) => {
        if (window.confirm("Are you sure you want to permanently remove this safe area? This cannot be undone.")) {
            await deleteDoc(doc(db, 'evacuation_centers', id));
        }
    };
    
    const handleOpenUpdateModal = (safeArea: EvacuationCenterDoc) => {
        setSelectedSafeArea(safeArea);
        setIsUpdateModalOpen(true);
    };

    const formatTime = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="p-4 space-y-6">
            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                    <Siren className="mr-2 text-red-500" /> Active Flood Reports
                </h2>
                <div className="space-y-3">
                    {floodReports.length > 0 ? floodReports.map(report => (
                        <div key={report.id} className="bg-white p-3 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-700">{report.level}</p>
                                    <p className="text-xs text-slate-500 flex items-center mt-1">
                                        <MapPin size={12} className="mr-1" />
                                        Lat: {report.location.latitude.toFixed(4)}, Lon: {report.location.longitude.toFixed(4)}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 pl-2">
                                     <button 
                                       onClick={() => handleMarkAsSubsided(report.id)}
                                       className="text-xs bg-red-100 text-red-700 font-semibold py-1 px-2.5 rounded-full hover:bg-red-200 flex items-center"
                                     >
                                        <XCircle size={14} className="mr-1.5" /> Mark as Subsided
                                    </button>
                                    <p className="text-xs text-slate-400 mt-1">Reported at {formatTime(report.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">No active flood reports.</p>}
                </div>
            </div>

            <div>
                <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center">
                    <ShieldCheck className="mr-2 text-green-500" /> Available Safe Areas
                </h2>
                <div className="space-y-3">
                     {safeAreas.length > 0 ? safeAreas.map(area => (
                        <div key={area.id} className="bg-white p-3 rounded-lg border border-slate-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-700">{area.name}</p>
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-500">
                                        <span className="flex items-center"><Activity size={12} className="mr-1" /> Status: <span className="font-medium text-slate-600 ml-1">{area.status}</span></span>
                                        <span className="flex items-center"><Users size={12} className="mr-1" /> Capacity: <span className="font-medium text-slate-600 ml-1">{area.capacity || 'N/A'}</span></span>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 flex-shrink-0 pl-2">
                                     <button onClick={() => handleOpenUpdateModal(area)} className="text-slate-500 hover:text-slate-800 p-1.5 rounded-full hover:bg-slate-100">
                                        <Edit size={16} />
                                     </button>
                                     <button onClick={() => handleDeleteSafeArea(area.id)} className="text-red-500 hover:text-red-800 p-1.5 rounded-full hover:bg-red-50">
                                        <Trash2 size={16} />
                                     </button>
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">No safe areas listed.</p>}
                </div>
            </div>

            {selectedSafeArea && (
                <UpdateSafeAreaModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    safeArea={selectedSafeArea}
                />
            )}
        </div>
    );
}