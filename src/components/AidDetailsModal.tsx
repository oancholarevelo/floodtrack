"use client";

import { AidItemDoc } from './AidView';

interface AidDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: AidItemDoc | null;
}

export default function AidDetailsModal({ isOpen, onClose, item }: AidDetailsModalProps) {
    if (!isOpen || !item) return null;

    const formatTime = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm">
                <h2 className="text-xl font-bold mb-2">{item.title}</h2>
                <p className="text-sm text-gray-500 mb-4">Posted: {formatTime(item.createdAt)}</p>
                
                <div className="space-y-3 text-gray-800">
                    <div>
                        <h3 className="font-semibold">Location:</h3>
                        <p>{item.location}</p>
                    </div>
                    {item.offerType && (
                        <div>
                            <h3 className="font-semibold">Type of Aid:</h3>
                            <p>{item.offerType}</p>
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold">Details & Contact:</h3>
                        <p className="whitespace-pre-wrap">{item.details}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}