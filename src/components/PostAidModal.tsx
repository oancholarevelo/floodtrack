"use client";

import { useState } from 'react';
import { AidPostData, AidTab, OfferType } from './AidView';

interface PostAidModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AidPostData) => void;
}

export default function PostAidModal({ isOpen, onClose, onSubmit }: PostAidModalProps) {
    const [postType, setPostType] = useState<AidTab>('requests');
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [details, setDetails] = useState('');
    const [offerType, setOfferType] = useState<OfferType>('Other');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !location || !details) {
            alert("Please fill out all fields.");
            return;
        }
        const postData: AidPostData = { type: postType, title, location, details };
        if (postType === 'offers') {
            postData.offerType = offerType;
        }
        onSubmit(postData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[2000]">
            <div className="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-sm">
                <h2 className="text-xl font-bold mb-4">Create a Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
                        <select
                            value={postType}
                            onChange={(e) => setPostType(e.target.value as AidTab)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="requests">I Need Help</option>
                            <option value="offers">I Can Offer Help</option>
                        </select>
                    </div>

                    {postType === 'offers' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Type of Aid</label>
                            <select
                                value={offerType}
                                onChange={(e) => setOfferType(e.target.value as OfferType)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option>Food/Water</option>
                                <option>Transport</option>
                                <option>Shelter</option>
                                <option>Volunteer</option>
                                <option>Other</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Need Drinking Water"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location / Barangay</label>
                        <input
                            type="text"
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g., Brgy. San Jose"
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="details" className="block text-sm font-medium text-gray-700">Details & Contact Info</label>
                        <textarea
                            id="details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Describe your situation and how to contact you."
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Submit Post
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}