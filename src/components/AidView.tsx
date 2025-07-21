"use client";

import { useState, useEffect } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, Timestamp, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import PostAidModal from './PostAidModal';
import AidDetailsModal from './AidDetailsModal';

export type AidTab = 'requests' | 'offers';
export type OfferType = 'Food/Water' | 'Transport' | 'Shelter' | 'Volunteer' | 'Other';

export interface AidPostData {
    type: AidTab;
    title: string;
    location: string;
    details: string;
    offerType?: OfferType;
    status?: 'helped' | 'help given';
}

export interface AidItemDoc {
    id: string;
    title: string;
    location: string;
    details: string;
    offerType?: OfferType;
    status?: 'helped' | 'help given';
    createdAt: Timestamp;
}

export default function AidView() {
    const [activeTab, setActiveTab] = useState<AidTab>('requests');
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedAidItem, setSelectedAidItem] = useState<AidItemDoc | null>(null);
    const [aidRequests, setAidRequests] = useState<AidItemDoc[]>([]);
    const [aidOffers, setAidOffers] = useState<AidItemDoc[]>([]);

    useEffect(() => {
        const createListener = (collectionName: string, setter: React.Dispatch<React.SetStateAction<AidItemDoc[]>>) => {
            const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
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

    const handleAidSubmit = async (postData: AidPostData) => {
        const collectionName = postData.type === 'requests' ? 'aid_requests' : 'aid_offers';
        const { type, ...data } = postData;
        const newPost = { ...data, createdAt: serverTimestamp() };

        try {
            await addDoc(collection(db, collectionName), newPost);
            setIsPostModalOpen(false);
        } catch (error) {
            console.error("Error adding aid post: ", error);
            alert("Failed to create post. Please try again.");
        }
    };
    
    const handleViewDetails = (item: AidItemDoc) => {
        setSelectedAidItem(item);
        setIsDetailsModalOpen(true);
    };

    const AidCard = (item: AidItemDoc) => (
        <div
            className={`bg-white p-4 rounded-lg border border-gray-200 transition-shadow ${
                item.status === 'helped' || item.status === 'help given' ? 'bg-gray-50 opacity-60' : 'hover:shadow-md'
            }`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{item.location}</p>
                </div>
                {item.offerType && (
                    <span className="text-xs font-semibold bg-cyan-100 text-cyan-800 px-2 py-1 rounded-full">{item.offerType}</span>
                )}
            </div>
            
            <p className="text-gray-700 text-sm mt-1 truncate">{item.details}</p>
            
            <button 
                onClick={() => handleViewDetails(item)}
                className="mt-4 w-full bg-cyan-600 text-white font-semibold py-2 rounded-lg hover:bg-cyan-700 transition-colors">
                View Details
            </button>

            {(item.status === 'helped' || item.status === 'help given') && (
                <div className="mt-2 text-center text-sm font-semibold text-green-600">
                    {item.status === 'helped' ? 'Marked as Helped' : 'Marked as Help Given'}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-4">
            <div className="flex bg-gray-200 rounded-full p-1 mb-4">
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'requests' ? 'bg-white text-cyan-700 shadow' : 'text-gray-600'}`}
                >
                    Need Help
                </button>
                <button 
                    onClick={() => setActiveTab('offers')}
                    className={`w-1/2 py-2 rounded-full text-sm font-semibold transition-colors ${activeTab === 'offers' ? 'bg-white text-cyan-700 shadow' : 'text-gray-600'}`}
                >
                    Offer Help
                </button>
            </div>
            
            <div className="relative mb-4">
                <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"/>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="space-y-3">
                {activeTab === 'requests' && aidRequests.map(item => <AidCard key={item.id} {...item} />)}
                {activeTab === 'offers' && aidOffers.map(item => <AidCard key={item.id} {...item} />)}
            </div>
            
            <div className="fixed bottom-20 right-4 z-10">
                 <button 
                    onClick={() => setIsPostModalOpen(true)}
                    className="bg-cyan-600 text-white font-bold py-3 px-5 rounded-full shadow-lg hover:bg-cyan-700 flex items-center space-x-2 transition-transform duration-200 hover:scale-105">
                    <PlusCircle size={20} />
                    <span>New Post</span>
                </button>
            </div>

            <PostAidModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                onSubmit={handleAidSubmit}
            />
            
            <AidDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                item={selectedAidItem}
            />
        </div>
    );
}