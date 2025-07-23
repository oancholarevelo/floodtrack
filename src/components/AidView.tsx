// src/components/AidView.tsx

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, PlusCircle, Clock, MapPin, CheckCircle, Heart, HandHelping, Siren, Navigation, AlertTriangle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, Timestamp, addDoc, serverTimestamp, query, orderBy, GeoPoint, where, getDocs, writeBatch } from 'firebase/firestore';
import AidDetailsModal from './AidDetailsModal';

// Interfaces
export type AidTab = 'requests' | 'offers';
export type OfferType = 'Food/Water' | 'Transport' | 'Shelter' | 'Volunteer' | 'Other';
export type AidStatus = 'active' | 'helped' | 'help given' | 'pending_deletion';

export interface AidPostData {
    type: AidTab;
    title: string;
    location: string;
    details: string;
    offerType?: OfferType;
}

export interface AidItemDoc {
    id: string;
    title: string;
    location: string;
    details: string;
    offerType?: OfferType;
    status: AidStatus;
    createdAt: Timestamp;
    isSOS?: boolean;
    coordinates?: GeoPoint;
}

const MemoizedAidDetailsModal = React.memo(AidDetailsModal);

export default function AidView({ location }: { location: string }) {
    const [activeTab, setActiveTab] = useState<AidTab>('requests');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAidItem, setSelectedAidItem] = useState<AidItemDoc | null>(null);
    const [aidRequests, setAidRequests] = useState<AidItemDoc[]>([]);
    const [aidOffers, setAidOffers] = useState<AidItemDoc[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSendingSOS, setIsSendingSOS] = useState(false);

    useEffect(() => {
        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

        const cleanupOldPosts = async (collectionName: string) => {
            try {
                const q = query(
                    collection(db, collectionName),
                    where('status', '==', 'active'),
                    where('createdAt', '<', Timestamp.fromDate(twoDaysAgo))
                );
                const snapshot = await getDocs(q);
                if (snapshot.empty) return;

                const batch = writeBatch(db);
                snapshot.docs.forEach(doc => {
                    batch.update(doc.ref, { status: 'pending_deletion' });
                });
                await batch.commit();
            } catch (error) {
                console.error(`Failed to clean up old posts in ${collectionName}:`, error);
            }
        };

        const createListener = (collectionName: string, setter: React.Dispatch<React.SetStateAction<AidItemDoc[]>>) => {
            cleanupOldPosts(collectionName);
            // FIX: This query now excludes items pending deletion from the view
            const q = query(collection(db, collectionName), where('status', '!=', 'pending_deletion'), orderBy('status'), orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AidItemDoc));
                setter(data);
            });
        };

        const unsubRequests = createListener('aid_requests', setAidRequests);
        const unsubOffers = createListener('aid_offers', setAidOffers);

        return () => {
            unsubRequests();
            unsubOffers();
        };
    }, []);
    
    const handleSOSClick = () => {
        if (!confirm("This will send an EMERGENCY SOS with your current location. Only use this in a life-threatening situation. Are you sure?")) return;
        if (!navigator.geolocation) {
            alert("Geolocation is not supported. Cannot send SOS.");
            return;
        }
        setIsSendingSOS(true);
        alert("Sending SOS... Please wait and do not close this page.");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                let locationString = `Exact Coordinates: Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
                const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
                if (apiKey) {
                    try {
                        const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${apiKey}`);
                        const data = await response.json();
                        if (data.features?.length > 0) {
                            locationString = data.features[0].properties.formatted;
                        }
                    } catch (error) {
                        console.error("Reverse geocoding failed, using coordinates as fallback.", error);
                    }
                }
                const newPost = {
                    title: "SOS - Immediate Assistance Needed",
                    details: "This is an automated SOS alert. User requires immediate help at this location.",
                    location: locationString,
                    coordinates: new GeoPoint(latitude, longitude),
                    createdAt: serverTimestamp(),
                    status: 'active' as AidStatus,
                    isSOS: true,
                };
                try {
                    await addDoc(collection(db, 'aid_requests'), newPost);
                    alert("SOS signal sent successfully. Your request is now at the top of the list.");
                } catch (error) {
                    console.error("Firebase post error:", error);
                    alert("Failed to send SOS. Please try again.");
                } finally {
                    setIsSendingSOS(false);
                }
            },
            (error) => {
                setIsSendingSOS(false);
                console.error("Geolocation error:", error);
                alert("Could not get your location. Please enable location services and try again.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleViewDetails = (item: AidItemDoc) => {
        setSelectedAidItem(item);
        setIsDetailsModalOpen(true);
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

    const filteredRequests = useMemo(() =>
        aidRequests
            .filter(item =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.location.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                if (a.isSOS && !b.isSOS) return -1;
                if (!a.isSOS && b.isSOS) return 1;
                return 0;
            }),
    [aidRequests, searchTerm]);

    const filteredOffers = useMemo(() =>
        aidOffers.filter(item =>
            item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.offerType?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [aidOffers, searchTerm]);
    
    const StatusBanner = ({ status }: { status: AidStatus }) => {
        if (status === 'active') return null;

        const bannerConfig: { [key in AidStatus]?: { text: string; color: string } } = {
            helped: { text: 'Request Fulfilled', color: 'green' },
            'help given': { text: 'Help Provided', color: 'green' },
            pending_deletion: { text: 'Pending Deletion', color: 'yellow' },
        };

        const config = bannerConfig[status];
        if (!config) return null;

        const colorClasses: { [key: string]: string } = {
            green: 'bg-green-100 text-green-600',
            yellow: 'bg-yellow-100 text-yellow-800'
        };

        const Icon = status === 'pending_deletion' ? AlertTriangle : CheckCircle;

        return (
            <div className={`mt-4 text-center text-sm font-semibold ${colorClasses[config.color]} py-2 rounded-lg flex items-center justify-center space-x-2`}>
                <Icon size={16} />
                <span>{config.text}</span>
            </div>
        );
    };

    const AidCard = (item: AidItemDoc) => {
        const isSOS = item.isSOS === true;
        const isPendingDeletion = item.status === 'pending_deletion';

        if (isSOS) {
            return (
                <div className={`rounded-xl shadow-lg bg-white overflow-hidden relative ${isPendingDeletion ? 'opacity-60' : 'animate-pulse-slow'}`}>
                    <div className="absolute left-0 top-0 bottom-0 w-2 bg-red-600"></div>
                    <div className="p-4 pl-6">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                                <Siren size={20} className="text-red-600 mr-2" />
                                <h4 className="font-bold text-lg text-red-700">SOS Assistance Needed</h4>
                            </div>
                            <span className="text-xs text-slate-500 flex-shrink-0">{formatTimeAgo(item.createdAt)}</span>
                        </div>
                        <div className="mb-3">
                            <div className="flex items-start space-x-2 text-slate-800">
                                <MapPin size={16} className="mt-1 flex-shrink-0 text-slate-500" />
                                <p className="font-semibold">{item.location}</p>
                            </div>
                            {item.coordinates && (
                                <p className="text-xs font-mono text-slate-500 mt-1 ml-8">
                                    {`Lat: ${item.coordinates.latitude.toFixed(5)}, Lng: ${item.coordinates.longitude.toFixed(5)}`}
                                </p>
                            )}
                        </div>
                        <p className="text-sm text-slate-700 mb-4">{item.details}</p>
                        {isPendingDeletion ? <StatusBanner status="pending_deletion" /> : (
                            <div className="flex flex-col sm:flex-row gap-2">
                                {item.coordinates && (
                                    <a 
                                        href={`https://www.google.com/maps/dir/?api=1&destination=${item.coordinates.latitude},${item.coordinates.longitude}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex-1 text-center bg-red-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center space-x-2"
                                    >
                                        <Navigation size={16} />
                                        <span>Get Directions</span>
                                    </a>
                                )}
                                <button onClick={() => handleViewDetails(item)} className="flex-1 text-center bg-white text-red-600 font-semibold py-2.5 px-4 rounded-lg hover:bg-red-50 transition-colors border-2 border-red-600">
                                    View Details
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className={`p-4 rounded-xl border bg-white transition-all duration-200 border-slate-200 ${item.status !== 'active' ? 'opacity-70' : 'hover:border-cyan-400 hover:shadow-lg hover:scale-[1.02]'}`}>
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 text-lg pr-2">{item.title}</h4>
                    {item.offerType && (<span className="text-xs font-semibold bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded-full whitespace-nowrap">{item.offerType}</span>)}
                </div>
                <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4">
                    <div className="flex items-center space-x-1.5"><MapPin size={14} /><span>{item.location}</span></div>
                    <div className="flex items-center space-x-1.5"><Clock size={14} /><span>{formatTimeAgo(item.createdAt)}</span></div>
                </div>
                <p className="text-slate-600 text-sm mt-3 h-10 overflow-hidden line-clamp-2">{item.details}</p>
                
                {item.status === 'active' ? (
                    <button onClick={() => handleViewDetails(item)} className="mt-4 w-full bg-cyan-600 text-white font-semibold py-2.5 rounded-lg hover:bg-cyan-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">View Details</button>
                ) : (
                    <StatusBanner status={item.status} />
                )}
            </div>
        );
    };

    const TabButton = ({ tab, label, icon }: { tab: AidTab, label: string, icon: React.ReactNode }) => (
        <button onClick={() => setActiveTab(tab)} className={`w-1/2 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${activeTab === tab ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}>
            {icon}<span>{label}</span>
        </button>
    );

    const currentList = activeTab === 'requests' ? filteredRequests : filteredOffers;

    return (
        <div className="h-full w-full flex flex-col relative">
            <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="flex bg-slate-100 rounded-full p-1 mb-4"><TabButton tab="requests" label="Need Help" icon={<HandHelping size={16} />} /><TabButton tab="offers" label="Offer Help" icon={<Heart size={16} />} /></div>
                <div className="relative">
                    <input type="text" placeholder={`Search in ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow" />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 pb-24">
                {currentList.length > 0 ? (
                    <div className="space-y-4">{currentList.map(item => <AidCard key={item.id} {...item} />)}</div>
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <h3 className="font-semibold text-lg">No {activeTab} found</h3>
                        <p className="text-sm">There are currently no posts in this category.</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-24 right-4 z-[2001] flex flex-col items-end space-y-3">
                 <button onClick={handleSOSClick} disabled={isSendingSOS} className="bg-red-600 text-white font-bold py-3 px-5 rounded-full shadow-lg hover:bg-red-700 flex items-center space-x-2 transition-all duration-200 hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed">
                    <Siren size={20} /><span>{isSendingSOS ? 'Sending...' : 'SOS'}</span>
                </button>
                <Link href={`/post-aid?location=${location}`} className="bg-cyan-600 text-white font-bold py-3 px-5 rounded-full shadow-lg hover:bg-cyan-700 flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
                    <PlusCircle size={20} /><span>New Post</span>
                </Link>
            </div>
            
            <MemoizedAidDetailsModal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} item={selectedAidItem} />
        </div>
    );
}