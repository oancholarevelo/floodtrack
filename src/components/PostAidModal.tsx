// src/components/PostAidModal.tsx

"use client";

import { useState, useEffect } from 'react';
import { AidPostData, AidTab, OfferType } from './AidView';
import { X } from 'lucide-react';

interface PostAidModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AidPostData) => void;
    location: string;
}

export default function PostAidModal({ isOpen, onClose, onSubmit, location }: PostAidModalProps) {
    const [postType, setPostType] = useState<AidTab>('requests');
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [addressDetails, setAddressDetails] = useState('');
    const [details, setDetails] = useState('');
    const [offerType, setOfferType] = useState<OfferType>('Other');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setCity(location.charAt(0).toUpperCase() + location.slice(1));
            setBarangay('');
            setAddressDetails('');
            setDetails('');
            setOfferType('Other');
            setPostType('requests');
        }
    }, [isOpen, location]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !city.trim() || !barangay.trim() || !addressDetails.trim() || !details.trim()) {
            alert("Please fill out all required fields.");
            return;
        }
        
        const fullLocation = `${addressDetails}, Brgy. ${barangay}, ${city}`;

        const postData: AidPostData = {
            type: postType,
            title,
            location: fullLocation,
            details
        };

        if (postType === 'offers') {
            postData.offerType = offerType;
        }
        onSubmit(postData);
    };

    const FormLabel: React.FC<{htmlFor: string, children: React.ReactNode}> = ({htmlFor, children}) => (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{children}</label>
    );

    const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
        <input {...props} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
    );

    const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
         <select {...props} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-[3000] p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh] relative">
                
                <div className="p-6 pb-4 border-b border-slate-200 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-slate-800">Create a Community Post</h2>
                     <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col flex-grow overflow-hidden">
                    <div className="overflow-y-auto p-6 space-y-4">
                        <div>
                            <FormLabel htmlFor="post-type">I want to...</FormLabel>
                            <SelectField id="post-type" value={postType} onChange={(e) => setPostType(e.target.value as AidTab)}>
                                <option value="requests">Request Help</option>
                                <option value="offers">Offer Help</option>
                            </SelectField>
                        </div>

                        {postType === 'offers' && (
                            <div>
                                <FormLabel htmlFor="offer-type">Type of Aid</FormLabel>
                                <SelectField id="offer-type" value={offerType} onChange={(e) => setOfferType(e.target.value as OfferType)}>
                                    <option>Food/Water</option>
                                    <option>Transport</option>
                                    <option>Shelter</option>
                                    <option>Volunteer</option>
                                    <option>Other</option>
                                </SelectField>
                            </div>
                        )}

                        <div>
                            <FormLabel htmlFor="title">Title / Headline</FormLabel>
                            <InputField type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Need Drinking Water for 2" required />
                        </div>
                        
                        <div>
                            <FormLabel htmlFor="city">City / Municipality</FormLabel>
                            <InputField type="text" id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g., Quezon City" required />
                        </div>
                        
                        <div>
                            <FormLabel htmlFor="barangay">Barangay</FormLabel>
                            <InputField type="text" id="barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} placeholder="e.g., Batasan Hills" required />
                        </div>

                        <div>
                            <FormLabel htmlFor="address-details">Street Address / Landmark</FormLabel>
                            <InputField type="text" id="address-details" value={addressDetails} onChange={(e) => setAddressDetails(e.target.value)} placeholder="e.g., 123 Constitution St., near the school" required />
                        </div>

                        <div>
                            <FormLabel htmlFor="details">Details & Contact Info</FormLabel>
                            <textarea
                                id="details" value={details} onChange={(e) => setDetails(e.target.value)}
                                placeholder="Please describe your situation and provide a contact number or instructions."
                                className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                rows={4} required
                            />
                        </div>
                    </div>
                    
                    <div className="p-6 pt-4 border-t border-slate-200 flex-shrink-0">
                        <div className="flex justify-end space-x-3">
                            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-semibold transition">
                                Cancel
                            </button>
                            <button type="submit" className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold transition shadow-sm hover:shadow-md">
                                Submit Post
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}