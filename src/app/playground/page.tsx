// src/app/playground/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot, doc, deleteDoc, GeoPoint, Timestamp, query, where } from 'firebase/firestore';
import { Trash2, ShieldCheck, Siren, Lock, HandHelping, Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Interfaces for all document types
interface FloodReportDoc {
    id: string;
    level: 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';
    location: GeoPoint;
    createdAt: Timestamp;
}

interface EvacuationCenterDoc {
    id: string;
    name: string;
    location: GeoPoint;
    createdAt: Timestamp;
}

interface AidItemDoc {
    id: string;
    title: string;
    location: string;
    createdAt: Timestamp;
}

const AdminDashboard = () => {
    const [pendingReports, setPendingReports] = useState<FloodReportDoc[]>([]);
    const [pendingSafeAreas, setPendingSafeAreas] = useState<EvacuationCenterDoc[]>([]);
    const [pendingAidRequests, setPendingAidRequests] = useState<AidItemDoc[]>([]);
    const [pendingAidOffers, setPendingAidOffers] = useState<AidItemDoc[]>([]);

    useEffect(() => {
        // Generic listener creator
        const createListener = <T extends { id: string }>(collectionName: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
            const q = query(collection(db, collectionName), where('status', '==', 'pending_deletion'));
            return onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setter(items);
            });
        };

        const unsubscribeReports = createListener<FloodReportDoc>('flood_reports', setPendingReports);
        const unsubscribeSafeAreas = createListener<EvacuationCenterDoc>('evacuation_centers', setPendingSafeAreas);
        const unsubscribeAidRequests = createListener<AidItemDoc>('aid_requests', setPendingAidRequests);
        const unsubscribeAidOffers = createListener<AidItemDoc>('aid_offers', setPendingAidOffers);

        return () => {
            unsubscribeReports();
            unsubscribeSafeAreas();
            unsubscribeAidRequests();
            unsubscribeAidOffers();
        };
    }, []);

    const handlePermanentDelete = async (collectionName: string, id: string, name: string) => {
        if (window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
            try {
                await deleteDoc(doc(db, collectionName, id));
                alert(`"${name}" has been permanently deleted.`);
            } catch (error) {
                console.error("Error during permanent deletion:", error);
                alert("Failed to delete the item. Please try again.");
            }
        }
    };
    
    const formatDate = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        return timestamp.toDate().toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    return (
        <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
            {/* Flood Reports Section */}
            <div>
                <h2 className="text-lg font-semibold text-slate-700 mb-2 flex items-center"><Siren size={20} className="mr-2 text-red-500" />Flood Reports</h2>
                {pendingReports.length > 0 ? pendingReports.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                        <div>
                            <p className="font-bold">{item.level} Flood Report</p>
                            <p className="text-xs text-slate-500">Requested on: {formatDate(item.createdAt)}</p>
                        </div>
                        <button onClick={() => handlePermanentDelete('flood_reports', item.id, `${item.level} report`)} className="bg-red-600 text-white font-bold py-2 px-3 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1.5">
                            <Trash2 size={16} /><span>Delete</span>
                        </button>
                    </div>
                )) : <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">No flood reports pending deletion.</p>}
            </div>

            {/* Safe Areas Section */}
            <div>
                <h2 className="text-lg font-semibold text-slate-700 mb-2 flex items-center"><ShieldCheck size={20} className="mr-2 text-green-500" />Safe Areas</h2>
                {pendingSafeAreas.length > 0 ? pendingSafeAreas.map(item => (
                     <div key={item.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                        <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-xs text-slate-500">Requested on: {formatDate(item.createdAt)}</p>
                        </div>
                        <button onClick={() => handlePermanentDelete('evacuation_centers', item.id, item.name)} className="bg-red-600 text-white font-bold py-2 px-3 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1.5">
                            <Trash2 size={16} /><span>Delete</span>
                        </button>
                    </div>
                )) : <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">No safe areas pending deletion.</p>}
            </div>

            {/* Aid Requests Section */}
            <div>
                <h2 className="text-lg font-semibold text-slate-700 mb-2 flex items-center"><HandHelping size={20} className="mr-2 text-blue-500" />Aid Requests</h2>
                {pendingAidRequests.length > 0 ? pendingAidRequests.map(item => (
                     <div key={item.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                        <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-xs text-slate-500">Requested on: {formatDate(item.createdAt)}</p>
                        </div>
                        <button onClick={() => handlePermanentDelete('aid_requests', item.id, item.title)} className="bg-red-600 text-white font-bold py-2 px-3 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1.5">
                            <Trash2 size={16} /><span>Delete</span>
                        </button>
                    </div>
                )) : <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">No aid requests pending deletion.</p>}
            </div>

            {/* Aid Offers Section */}
            <div>
                <h2 className="text-lg font-semibold text-slate-700 mb-2 flex items-center"><Heart size={20} className="mr-2 text-pink-500" />Aid Offers</h2>
                {pendingAidOffers.length > 0 ? pendingAidOffers.map(item => (
                     <div key={item.id} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                        <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-xs text-slate-500">Requested on: {formatDate(item.createdAt)}</p>
                        </div>
                        <button onClick={() => handlePermanentDelete('aid_offers', item.id, item.title)} className="bg-red-600 text-white font-bold py-2 px-3 rounded-md hover:bg-red-700 transition-colors flex items-center space-x-1.5">
                            <Trash2 size={16} /><span>Delete</span>
                        </button>
                    </div>
                )) : <p className="text-sm text-slate-500 p-4 text-center bg-slate-50 rounded-lg">No aid offers pending deletion.</p>}
            </div>
        </main>
    );
};

export default function PlaygroundPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === process.env.NEXT_PUBLIC_PLAYGROUND_PASSWORD) {
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Incorrect password.');
        }
    };

    if (isAuthenticated) {
        return (
            <div className="flex flex-col h-screen bg-slate-50">
                <header className="flex-shrink-0 bg-white px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] z-20 flex items-center justify-between border-b border-slate-100">
                    <Link
                        href="/"
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
                        aria-label="Back to app"
                    >
                        <ArrowLeft size={24} className="text-slate-600" />
                    </Link>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                            <p className="text-sm text-slate-500">Deletion Requests</p>
                        </div>
                        <Image src="/logo.png" alt="FloodTrack Logo" width={40} height={40} priority />
                    </div>
                </header>
                <AdminDashboard />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
            <div className="w-full max-w-sm p-8 space-y-4 bg-white rounded-2xl shadow-lg">
                <div className="flex flex-col items-center">
                    <Lock size={32} className="text-slate-500" />
                    <h1 className="text-2xl font-bold text-slate-800 mt-2">Admin Access</h1>
                    <p className="text-sm text-slate-500">Enter password to continue.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-cyan-600 text-white font-bold py-2.5 rounded-lg hover:bg-cyan-700 transition-colors"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}