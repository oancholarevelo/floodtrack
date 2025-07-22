"use client";

import { useState } from 'react';
import { X } from 'lucide-react';

// Define FloodLevel type here or import from a shared types file
export type FloodLevel = 'Ankle-deep' | 'Knee-deep' | 'Waist-deep';

interface ReportFloodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (level: FloodLevel, status: 'active') => void;
}

export default function ReportFloodModal({ isOpen, onClose, onSubmit }: ReportFloodModalProps) {
    const [selectedLevel, setSelectedLevel] = useState<FloodLevel>('Ankle-deep');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(selectedLevel, 'active');
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
                <h2 className="text-2xl font-bold mb-2 text-slate-800">Report Flood Level</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Select the estimated water level at the pinned location.
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
                        <button type="submit" className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition shadow-sm hover:shadow-md">
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}