"use client";

import { useState } from 'react';
import { X } from 'lucide-react'; // Removed Shield, Users, Activity

export interface SafeAreaData {
    name: string;
    capacity: number | null;
    status: string;
}

interface AddSafeAreaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SafeAreaData) => void;
}

export default function AddSafeAreaModal({ isOpen, onClose, onSubmit }: AddSafeAreaModalProps) {
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState<number | null>(null);
    const [status, setStatus] = useState('Open');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Please provide a name for the safe area.");
            return;
        }
        onSubmit({ name, capacity, status });
    };

    const FormLabel: React.FC<{htmlFor: string, children: React.ReactNode}> = ({htmlFor, children}) => (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{children}</label>
    );
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[3000] p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Add a Safe Area</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <FormLabel htmlFor="name">Safe Area Name</FormLabel>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., San Jose Covered Court" required className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div>
                        <FormLabel htmlFor="status">Current Status</FormLabel>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500">
                            <option>Open</option>
                            <option>Full</option>
                            <option>Closed</option>
                        </select>
                    </div>
                     <div>
                        <FormLabel htmlFor="capacity">Estimated Capacity (Optional)</FormLabel>
                        <input id="capacity" type="number" value={capacity ?? ''} onChange={(e) => setCapacity(e.target.value ? parseInt(e.target.value) : null)} placeholder="e.g., 150" className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500" />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-semibold">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                            Add Safe Area
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}