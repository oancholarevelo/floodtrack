"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import { FloodLevel } from './MapView';

interface FloodReportDoc {
    id: string;
    level: FloodLevel;
}

interface UpdateFloodReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: FloodReportDoc | null;
}

export default function UpdateFloodReportModal({ isOpen, onClose, report }: UpdateFloodReportModalProps) {
    const [selectedLevel, setSelectedLevel] = useState<FloodLevel>('Ankle-deep');

    useEffect(() => {
        if (report) {
            setSelectedLevel(report.level);
        }
    }, [report]);

    if (!isOpen || !report) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const reportRef = doc(db, 'flood_reports', report.id);
        await updateDoc(reportRef, { 
            level: selectedLevel,
            updatedAt: serverTimestamp() // Add this line
        });
        onClose();
    };

    const LevelOption = ({ level, current, onChange }: { level: FloodLevel, current: FloodLevel, onChange: (level: FloodLevel) => void }) => {
        const levelsInfo = {
            'Ankle-deep': { color: 'bg-yellow-400', label: 'Ankle-Deep' },
            'Knee-deep': { color: 'bg-orange-400', label: 'Knee-Deep' },
            'Waist-deep': { color: 'bg-red-400', label: 'Waist-Deep' },
        };

        const { color, label } = levelsInfo[level];
        const isSelected = current === level;

        return (
            <button
                type="button"
                onClick={() => onChange(level)}
                className={`w-full p-4 rounded-lg text-left font-semibold transition-all duration-200 flex items-center space-x-3 ${
                    isSelected ? `ring-2 ring-offset-2 ring-cyan-500 text-slate-900 ${color}` : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
            >
                <div className={`w-5 h-5 rounded-full ${color} border-2 border-white`}></div>
                <span>{label}</span>
            </button>
        )
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[3000] p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Update Flood Level</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Select the new estimated water level at this location.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3 mb-8">
                       <LevelOption level="Ankle-deep" current={selectedLevel} onChange={setSelectedLevel} />
                       <LevelOption level="Knee-deep" current={selectedLevel} onChange={setSelectedLevel} />
                       <LevelOption level="Waist-deep" current={selectedLevel} onChange={setSelectedLevel} />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-semibold transition">
                            Cancel
                        </button>
                        <button type="submit" className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold transition shadow-sm hover:shadow-md">
                            Update Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}