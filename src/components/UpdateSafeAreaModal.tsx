"use client";

import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { X } from 'lucide-react';
import { Filter } from 'bad-words';

// --- Profanity Filter Setup ---
const filter = new Filter();
const customBadWords = [
    "fuckyou","putang ina mo","tanginang","gago ka","bobo ka","tanga ka","tarantado ka","ulol ka","pakshet ka","puta ka","hayop ka", "walang hiya ka","leche ka","punyeta ka","inutil ka","buwisit ka","sira ulo ka","puke mo","titi mo","tae ka","kupal ka", "yawa ka","pisti ka","hindot ka","bonak ka","engot ka","ungas ka","tunggak ka","gunggong ka","mangmang ka","lintik ka", "supot ka","pakyu ka","bonggo ka","kamote ka","abnoy ka","sinto sinto ka","kulang kulang ka","may sayad ka","gagita ka","epal ka","pokpok ka","jologs ka","salot ka","taksil ka","ampalaya ka","chaka ka","bakla ka","tomboy ka","walang kwenta ka","demonyo ka","walang modo ka","hampaslupa ka","bastos ka","pangit ka","barok ka","barumbado ka",
    "sipsip ka","plastic ka","feelingero ka","feelingera ka", "balasubas ka","swapang ka","matigas ang ulo ka","sungit ka","praning ka","baliw ka","sakit sa ulo ka","sakit sa bangs ka","walang utak ka","bobita ka", "ampaw ka","tsismoso ka","tsismosa ka","landi ka","malandi ka","malas ka","olopong ka","turo turo ka","buraot ka","patay gutom ka", "payatot ka","tabatsoy ka","bilat mo","kukote ka","kukot ka","otot ka","buyung ka","yagit ka","sakang ka","pangit ang ugali ka", "mukhang pera ka","sosyal ka","baduy ka","jologs na jologs ka","ksp ka","kulit ka","arte ka","loka loka ka","churva ka","petiks ka", "jebs ka","shunga ka","amputa","animal ka","bilat","binibrocha","bobo","bogo","boto","brocha","burat","bwesit",
    "bwisit","demonyo ka","engot","etits","gaga","gagi","gago","habal","hayop ka","hayup","hinampak","hinayupak","hindot","hindutan","hudas","iniyot","inutel","inutil","iyot","kagaguhan","kagang","kantot","kantotan","kantut","kantutan","kaululan","kayat","kiki","kikinginamo","kingina","kupal","leche","leching","lechugas","lintik","nakakaburat","nimal","ogag","olok","pakingshet","pakshet","pakyu","pesteng yawa","poke","poki","pokpok","poyet","pu'keng","pucha","puchanggala","puchangina","puke","puki","pukinangina","puking","punyeta","puta","putang","putang ina","putangina","putanginamo","putaragis","putragis","puyet","ratbu","shunga","sira ulo","siraulo","suso","susu","tae","taena","tamod","tanga","tangina", "tanginang", 
    "gago ka", "bobo ka", "tanga ka","fuck ka","shit ka","damn ka","asshole ka","douche ka","noob ka","shitty ka","bullshit ka","fucker ka","bitch ka", "jerk ka","loser ka","dumbass ka","fucktard ka","idiot ka","moron ka","bastard ka","prick ka","dick ka","cunt ka", "ass ka","piss off ka","screw you ka","fucking idiot ka","damn fool ka","stupid ka","lame ka","crappy ka","freak ka","nutcase ka", "dork ka","nerd ka","weirdo ka","wacko ka","dipshit ka","shithead ka","douchebag ka","jackass ka","tool ka","twat ka", "butthead ka","shitface ka","fuckwit ka","dumbshit ka","asshat ka","retard ka","fool ka","goof ka","punk ka","schmuck ka", "numbskull ka","blockhead ka","bonehead ka","knucklehead ka","shitbag ka","cock ka",
    "dickhead ka","pussy ka","wuss ka","sissy ka", "coward ka","lousy ka","trash ka","scum ka","dirtbag ka","sleaze ka","creep ka","perv ka","faggot ka","queer ka", "dumb ka","stupid ass ka","fuckface ka","shitforbrains ka","dimwit ka","halfwit ka","doucheface ka","shitty ass ka","lameass ka","fucking loser ka", "bitchface ka","asswipe ka","fuckhead ka","damn jerk ka","idiot face ka","moron ka","dickface ka","cuntface ka","shitass ka","dumb fuck ka", "crackhead ka","nutjob ka","freakshow ka","shitshow ka","dumbass fool ka","lame fuck ka","stupid bitch ka","fucking moron ka"
];
filter.addWords(...customBadWords);
// --- End of Profanity Filter Setup ---

interface EvacuationCenterDoc {
    id: string;
    name: string;
    capacity?: number;
    status?: 'Open' | 'Full' | 'Closed' | 'pending_deletion';
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
            if (safeArea.status && safeArea.status !== 'pending_deletion') {
                setStatus(safeArea.status);
            }
        }
    }, [safeArea]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (filter.isProfane(name)) {
            alert("The name contains inappropriate language. Please revise it.");
            return;
        }

        const safeAreaRef = doc(db, 'evacuation_centers', safeArea.id);
        await updateDoc(safeAreaRef, { 
            name, 
            capacity, 
            status,
            updatedAt: serverTimestamp()
        });
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