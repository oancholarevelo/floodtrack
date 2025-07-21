"use client";

import { useState } from 'react';
import { FloodLevel } from './MapView';

interface ReportFloodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (level: FloodLevel) => void;
}

export default function ReportFloodModal({ isOpen, onClose, onSubmit }: ReportFloodModalProps) {
    const [selectedLevel, setSelectedLevel] = useState<FloodLevel>('Ankle-deep');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(selectedLevel);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm">
                <h2 className="text-xl font-bold mb-2">Report Flood Level</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Select the estimated water level at the pinned location.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label htmlFor="flood-level" className="block text-sm font-medium text-gray-700 mb-2">
                            Water Level
                        </label>
                        <select
                            id="flood-level"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value as FloodLevel)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="Ankle-deep">Ankle-deep</option>
                            <option value="Knee-deep">Knee-deep</option>
                            <option value="Waist-deep">Waist-deep</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold"
                        >
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}