"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { X } from 'lucide-react';

interface EvacuationCenterDoc {
    id: string;
    name: string;
    capacity?: number;
    status?: 'Open' | 'Full' | 'Closed';
}

interface UpdateSafeAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    safeArea: EvacuationCenterDoc;
}

export default function UpdateSafeAreaModal({ isOpen, onClose, safeArea }: UpdateSafeAreaModalProps) {
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState<number | null>(null);
    const [status, setStatus] = useState<'Open' | 'Full' | 'Closed'>('Open');

    useEffect(() => {
        if (safeArea) {
            setName(safeArea.name);
            setCapacity(safeArea.capacity || null);
            setStatus(safeArea.status || 'Open');
        }
    }, [safeArea]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const safeAreaRef = doc(db, 'evacuation_centers', safeArea.id);
        await updateDoc(safeAreaRef, { name, capacity, status });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[3000] p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"><X size={24} /></button>
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Update Safe Area</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="update-name" className="block text-sm font-medium text-slate-700 mb-1">Safe Area Name</label>
                        <input id="update-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <label htmlFor="update-status" className="block text-sm font-medium text-slate-700 mb-1">Current Status</label>
                        <select id="update-status" value={status} onChange={(e) => setStatus(e.target.value as 'Open' | 'Full' | 'Closed')} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                            <option>Open</option>
                            <option>Full</option>
                            <option>Closed</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="update-capacity" className="block text-sm font-medium text-slate-700 mb-1">Estimated Capacity (Optional)</label>
                        <input id="update-capacity" type="number" value={capacity ?? ''} onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g., 150" className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-semibold">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold">Update Information</button>
                    </div>
                </form>
            </div>
        </div>
    );
}