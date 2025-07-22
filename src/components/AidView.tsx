"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, PlusCircle, Clock, MapPin, CheckCircle, Heart, HandHelping, Siren } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, Timestamp, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import PostAidModal from './PostAidModal';
import AidDetailsModal from './AidDetailsModal';

// --- INTERFACES ---
export type AidTab = 'requests' | 'offers';
export type OfferType = 'Food/Water' | 'Transport' | 'Shelter' | 'Volunteer' | 'Other';
export type AidStatus = 'active' | 'helped' | 'help given';

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
    isSOS?: boolean; // Added for the SOS feature
}

// --- MEMOIZED COMPONENTS ---
const MemoizedPostAidModal = React.memo(PostAidModal);
const MemoizedAidDetailsModal = React.memo(AidDetailsModal);

// --- MAIN COMPONENT ---
export default function AidView({ location }: { location: string }) {
    const [activeTab, setActiveTab] = useState<AidTab>('requests');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAidItem, setSelectedAidItem] = useState<AidItemDoc | null>(null);
    const [aidRequests, setAidRequests] = useState<AidItemDoc[]>([]);
    const [aidOffers, setAidOffers] = useState<AidItemDoc[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSendingSOS, setIsSendingSOS] = useState(false);

    useEffect(() => {
        const createListener = (collectionName: string, setter: React.Dispatch<React.SetStateAction<AidItemDoc[]>>) => {
            const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
            return onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), status: doc.data().status || 'active' } as AidItemDoc));
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

    // --- SOS BUTTON HANDLER ---
    const handleSOSClick = () => {
        if (!confirm("This will send an EMERGENCY SOS with your current location. Only use this in a life-threatening situation. Are you sure?")) {
            return;
        }

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser. Cannot send SOS.");
            return;
        }

        setIsSendingSOS(true);
        alert("Sending SOS... Getting your location. Please wait and do not close this page.");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                let locationString = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;

                // Attempt to get a human-readable address
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
                    details: "This is an automated SOS alert. User requires immediate help at their location.",
                    location: locationString,
                    createdAt: serverTimestamp(),
                    status: 'active' as AidStatus,
                    isSOS: true,
                };

                try {
                    await addDoc(collection(db, 'aid_requests'), newPost);
                    alert("SOS signal sent successfully. Your request is now at the top of the list.");
                } catch (error) {
                    alert("Failed to send SOS. Please check your internet connection and try again.");
                } finally {
                    setIsSendingSOS(false);
                }
            },
            (error) => {
                setIsSendingSOS(false);
                console.error(`Geolocation error: ${error.message}`);
                alert("Could not get your location. Please enable location services in your browser settings and try again.");
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };


    const handleAidSubmit = useCallback(async (postData: AidPostData) => {
        const collectionName = postData.type === 'requests' ? 'aid_requests' : 'aid_offers';
        const { type: _, ...data } = postData;
        const newPost = { ...data, createdAt: serverTimestamp(), status: 'active' };

        await addDoc(collection(db, collectionName), newPost);
        setIsPostModalOpen(false);
    }, []);

    const handleClosePostModal = useCallback(() => {
        setIsPostModalOpen(false);
    }, []);

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

    // Updated filtering logic to pin SOS posts to the top
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

    // --- RENDER COMPONENTS ---
    const AidCard = (item: AidItemDoc) => {
        const isSOS = item.isSOS === true;

        return (
            <div
                className={`p-4 rounded-xl border-2 transition-all duration-200 
                    ${isSOS ? 'border-red-500 bg-red-50' : 'border-slate-200 bg-white'} 
                    ${item.status !== 'active' ? 'opacity-70' : 'hover:shadow-lg hover:scale-[1.02]'}`}
            >
                <div className="flex justify-between items-start">
                    <h4 className={`font-bold text-lg pr-2 ${isSOS ? 'text-red-800' : 'text-slate-800'}`}>
                        {isSOS && <Siren size={16} className="inline-block mr-2 mb-1 text-red-600" />}
                        {item.title}
                    </h4>
                    {item.offerType && (
                        <span className="text-xs font-semibold bg-cyan-100 text-cyan-800 px-2.5 py-1 rounded-full whitespace-nowrap">{item.offerType}</span>
                    )}
                </div>

                <div className="flex items-center text-sm text-slate-500 mt-1 space-x-4">
                    <div className="flex items-center space-x-1.5">
                        <MapPin size={14} />
                        <span>{item.location}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                        <Clock size={14} />
                        <span>{formatTimeAgo(item.createdAt)}</span>
                    </div>
                </div>

                <p className="text-slate-600 text-sm mt-3 h-10 overflow-hidden line-clamp-2">{item.details}</p>

                {item.status !== 'active' ? (
                    <div className="mt-4 text-center text-sm font-semibold text-green-600 bg-green-100 py-2 rounded-lg flex items-center justify-center space-x-2">
                        <CheckCircle size={16} />
                        <span>{item.status === 'helped' ? 'Request Fulfilled' : 'Help Provided'}</span>
                    </div>
                ) : (
                    <button
                        onClick={() => handleViewDetails(item)}
                        className={`mt-4 w-full text-white font-semibold py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                            ${isSOS ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500'}`}
                    >
                        View Details
                    </button>
                )}
            </div>
        )
    };

    const TabButton = ({ tab, label, icon }: { tab: AidTab, label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-1/2 py-3 rounded-full text-sm font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${activeTab === tab ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );

    const currentList = activeTab === 'requests' ? filteredRequests : filteredOffers;

    return (
        <div className="h-full w-full flex flex-col relative">
            <div className="p-4 bg-white border-b border-slate-100 sticky top-0 z-10">
                <div className="flex bg-slate-100 rounded-full p-1 mb-4">
                    <TabButton tab="requests" label="Need Help" icon={<HandHelping size={16} />} />
                    <TabButton tab="offers" label="Offer Help" icon={<Heart size={16} />} />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder={`Search in ${activeTab}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
                {currentList.length > 0 ? (
                    <div className="space-y-4">
                        {currentList.map(item => <AidCard key={item.id} {...item} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <h3 className="font-semibold text-lg">No {activeTab} found</h3>
                        <p className="text-sm">There are currently no posts in this category.</p>
                    </div>
                )}
            </div>
            
            <div className="fixed bottom-24 right-4 z-[2001] flex flex-col items-end space-y-3">
                 <button
                    onClick={handleSOSClick}
                    disabled={isSendingSOS}
                    className="bg-red-600 text-white font-bold py-3 px-5 rounded-full shadow-lg hover:bg-red-700 flex items-center space-x-2 transition-all duration-200 hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed"
                >
                    <Siren size={20} />
                    <span>{isSendingSOS ? 'Sending...' : 'SOS'}</span>
                </button>
                <button
                    onClick={() => setIsPostModalOpen(true)}
                    className="bg-cyan-600 text-white font-bold py-3 px-5 rounded-full shadow-lg hover:bg-cyan-700 flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
                    <PlusCircle size={20} />
                    <span>New Post</span>
                </button>
            </div>

            <MemoizedPostAidModal
                isOpen={isPostModalOpen}
                onClose={handleClosePostModal}
                onSubmit={handleAidSubmit}
                location={location}
            />

            <MemoizedAidDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                item={selectedAidItem}
            />
        </div>
    );
}