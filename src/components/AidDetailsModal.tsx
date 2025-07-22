"use client";

import { AidItemDoc } from './AidView';
import { db } from '../lib/firebase';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { X, MapPin, Clock, Tag, FileText, CheckCircle } from 'lucide-react';

interface AidDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: AidItemDoc | null;
}

export default function AidDetailsModal({ isOpen, onClose, item }: AidDetailsModalProps) {
    if (!isOpen || !item) return null;

    const formatTime = (timestamp: Timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    };

    const handleMarkAsComplete = async () => {
        if (item) {
            const isOffer = !!item.offerType;
            const collectionName = isOffer ? 'aid_offers' : 'aid_requests';
            const docRef = doc(db, collectionName, item.id);
            const newStatus = isOffer ? 'help given' : 'helped';
            await updateDoc(docRef, { status: newStatus });
            onClose();
        }
    };

    const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | undefined }) => (
        <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-slate-400 mt-1">{icon}</div>
            <div>
                <h3 className="text-sm font-semibold text-slate-500">{label}</h3>
                <p className="text-slate-800 whitespace-pre-wrap">{value || 'Not specified'}</p>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[3000] p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-2 text-slate-800">{item.title}</h2>
                <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6">
                    <Clock size={12} />
                    <span>Posted: {formatTime(item.createdAt)}</span>
                </div>

                <div className="space-y-4">
                    <DetailItem icon={<MapPin size={20} />} label="Location" value={item.location} />
                    {item.offerType && (
                        <DetailItem icon={<Tag size={20} />} label="Type of Aid" value={item.offerType} />
                    )}
                    <DetailItem icon={<FileText size={20} />} label="Details & Contact" value={item.details} />
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-semibold transition"
                    >
                        Close
                    </button>
                    {item.status === 'active' && (
                        <button
                            type="button"
                            onClick={handleMarkAsComplete}
                            className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition shadow-sm hover:shadow-md flex items-center space-x-2"
                        >
                            <CheckCircle size={16} />
                            <span>{item.offerType ? 'Mark as Help Given' : 'Mark as Helped'}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}