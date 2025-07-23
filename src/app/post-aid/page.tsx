// src/app/post-aid/page.tsx

"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AidTab, OfferType } from '../../components/AidView';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp, GeoPoint, Timestamp, FieldValue } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Filter } from 'bad-words';

// --- Profanity Filter Setup ---
const filter = new Filter();

// Added common variations to the list for a more robust filter
const customBadWords = [
    "fuckyou","putang ina mo","tanginang","gago ka","bobo ka","tanga ka","tarantado ka","ulol ka","pakshet ka","puta ka","hayop ka", "walang hiya ka","leche ka","punyeta ka","inutil ka","buwisit ka","sira ulo ka","puke mo","titi mo","tae ka","kupal ka", "yawa ka","pisti ka","hindot ka","bonak ka","engot ka","ungas ka","tunggak ka","gunggong ka","mangmang ka","lintik ka", "supot ka","pakyu ka","bonggo ka","kamote ka","abnoy ka","sinto sinto ka","kulang kulang ka","may sayad ka","gagita ka","epal ka","pokpok ka","jologs ka","salot ka","taksil ka","ampalaya ka","chaka ka","bakla ka","tomboy ka","walang kwenta ka","demonyo ka","walang modo ka","hampaslupa ka","bastos ka","pangit ka","barok ka","barumbado ka",
    "sipsip ka","plastic ka","feelingero ka","feelingera ka", "balasubas ka","swapang ka","matigas ang ulo ka","sungit ka","praning ka","baliw ka","sakit sa ulo ka","sakit sa bangs ka","walang utak ka","bobita ka", "ampaw ka","tsismoso ka","tsismosa ka","landi ka","malandi ka","malas ka","olopong ka","turo turo ka","buraot ka","patay gutom ka", "payatot ka","tabatsoy ka","bilat mo","kukote ka","kukot ka","otot ka","buyung ka","yagit ka","sakang ka","pangit ang ugali ka", "mukhang pera ka","sosyal ka","baduy ka","jologs na jologs ka","ksp ka","kulit ka","arte ka","loka loka ka","churva ka","petiks ka", "jebs ka","shunga ka","amputa","animal ka","bilat","binibrocha","bobo","bogo","boto","brocha","burat","bwesit",
    "bwisit","demonyo ka","engot","etits","gaga","gagi","gago","habal","hayop ka","hayup","hinampak","hinayupak","hindot","hindutan","hudas","iniyot","inutel","inutil","iyot","kagaguhan","kagang","kantot","kantotan","kantut","kantutan","kaululan","kayat","kiki","kikinginamo","kingina","kupal","leche","leching","lechugas","lintik","nakakaburat","nimal","ogag","olok","pakingshet","pakshet","pakyu","pesteng yawa","poke","poki","pokpok","poyet","pu'keng","pucha","puchanggala","puchangina","puke","puki","pukinangina","puking","punyeta","puta","putang","putang ina","putangina","putanginamo","putaragis","putragis","puyet","ratbu","shunga","sira ulo","siraulo","suso","susu","tae","taena","tamod","tanga","tangina", "tanginang", 
    "gago ka", "bobo ka", "tanga ka","fuck ka","shit ka","damn ka","asshole ka","douche ka","noob ka","shitty ka","bullshit ka","fucker ka","bitch ka", "jerk ka","loser ka","dumbass ka","fucktard ka","idiot ka","moron ka","bastard ka","prick ka","dick ka","cunt ka", "ass ka","piss off ka","screw you ka","fucking idiot ka","damn fool ka","stupid ka","lame ka","crappy ka","freak ka","nutcase ka", "dork ka","nerd ka","weirdo ka","wacko ka","dipshit ka","shithead ka","douchebag ka","jackass ka","tool ka","twat ka", "butthead ka","shitface ka","fuckwit ka","dumbshit ka","asshat ka","retard ka","fool ka","goof ka","punk ka","schmuck ka", "numbskull ka","blockhead ka","bonehead ka","knucklehead ka","shitbag ka","cock ka",
    "dickhead ka","pussy ka","wuss ka","sissy ka", "coward ka","lousy ka","trash ka","scum ka","dirtbag ka","sleaze ka","creep ka","perv ka","faggot ka","queer ka", "dumb ka","stupid ass ka","fuckface ka","shitforbrains ka","dimwit ka","halfwit ka","doucheface ka","shitty ass ka","lameass ka","fucking loser ka", "bitchface ka","asswipe ka","fuckhead ka","damn jerk ka","idiot face ka","moron ka","dickface ka","cuntface ka","shitass ka","dumb fuck ka", "crackhead ka","nutjob ka","freakshow ka","shitshow ka","dumbass fool ka","lame fuck ka","stupid bitch ka","fucking moron ka"
];

filter.addWords(...customBadWords);
// --- End of Profanity Filter Setup ---

interface NewPost {
    title: string;
    location: string;
    details: string;
    createdAt: Timestamp | FieldValue;
    status: string;
    offerType?: OfferType;
    coordinates?: GeoPoint;
}

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

        if (filter.isProfane(title) || filter.isProfane(details)) {
            alert("Your post contains inappropriate language. Please revise it.");
            return;
        }

        setIsSubmitting(true);
        
        const fullLocation = `${addressDetails}, Brgy. ${barangay}, ${city}`;
        const collectionName = postType === 'requests' ? 'aid_requests' : 'aid_offers';
        
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