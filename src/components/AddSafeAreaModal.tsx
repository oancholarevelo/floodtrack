"use client";

import { useState } from 'react';
import { X } from 'lucide-react';
import {Filter } from 'bad-words';

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
        if (filter.isProfane(name)) {
            alert("The name contains inappropriate language. Please revise it.");
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