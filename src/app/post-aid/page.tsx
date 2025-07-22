// src/app/post-aid/page.tsx

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AidTab, OfferType } from '../../components/AidView';
import { db } from '../../lib/firebase';
// Import FieldValue alongside the other Firestore types
import { collection, addDoc, serverTimestamp, GeoPoint, Timestamp, FieldValue } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

// Type for our new post object to satisfy TypeScript rules
interface NewPost {
    title: string;
    location: string;
    details: string;
    // Allow createdAt to be a Timestamp (when read) or a FieldValue (when written)
    createdAt: Timestamp | FieldValue;
    status: string;
    offerType?: OfferType;
    coordinates?: GeoPoint;
}

// Helper Components defined outside
const FormLabel: React.FC<{htmlFor: string, children: React.ReactNode}> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1">{children}</label>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="mt-1 w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition" />
);

const SelectField: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
     <div className="relative mt-1">
        <select
            {...props}
            className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-slate-800 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
        </div>
    </div>
);


function PostAidForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialLocation = searchParams.get('location') || '';

    const [postType, setPostType] = useState<AidTab>('requests');
    const [title, setTitle] = useState('');
    const [city, setCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [addressDetails, setAddressDetails] = useState('');
    const [details, setDetails] = useState('');
    const [offerType, setOfferType] = useState<OfferType>('Other');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialLocation) {
            setCity(initialLocation.charAt(0).toUpperCase() + initialLocation.slice(1));
        }
    }, [initialLocation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !city.trim() || !barangay.trim() || !addressDetails.trim() || !details.trim()) {
            alert("Please fill out all required fields.");
            return;
        }
        setIsSubmitting(true);
        
        const fullLocation = `${addressDetails}, Brgy. ${barangay}, ${city}`;
        const collectionName = postType === 'requests' ? 'aid_requests' : 'aid_offers';
        
        // No change is needed here, but now it correctly matches the updated NewPost type
        const postData: Partial<NewPost> = {
            title,
            location: fullLocation,
            details,
            createdAt: serverTimestamp(),
            status: 'active'
        };

        if (postType === 'offers') {
            postData.offerType = offerType;
        }
        
        try {
            await addDoc(collection(db, collectionName), postData);
            alert("Your post has been submitted successfully!");
            router.back();
        } catch (error) {
            console.error("Error submitting post:", error);
            alert("There was an error submitting your post. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen">
             <header className="bg-white px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] z-[2000] sticky top-0 flex items-center justify-start border-b border-slate-100">
                <button onClick={() => router.back()} className="p-2 mr-2 rounded-full hover:bg-slate-100">
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div className="flex items-center space-x-3">
                    <Image src="/logo.png" alt="FloodTrack Logo" width={40} height={40} priority />
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Create a Post</h1>
                        <p className="text-sm text-slate-500">Community Aid</p>
                    </div>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto p-4">
                 <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => router.back()} className="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-lg hover:bg-slate-200 font-semibold transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 font-semibold transition shadow-sm hover:shadow-md disabled:bg-cyan-400">
                            {isSubmitting ? 'Submitting...' : 'Submit Post'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default function PostAidPage() {
    return (
        <Suspense fallback={<div>Loading form...</div>}>
            <PostAidForm />
        </Suspense>
    );
}