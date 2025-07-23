// src/components/HotlinesView.tsx

"use client";

import { Phone, Heart, LucideIcon, ShieldAlert, Siren, CloudRain, Building, MapPin } from 'lucide-react';

// Define TypeScript interfaces for our data structures
interface Contact {
  name: string;
  numbers: string[];
}

interface HotlineCategory {
  title: string;
  icon: LucideIcon;
  contacts: Contact[];
  note?: string;
}

// Updated and expanded list of national hotlines
const nationalHotlineData: { [key: string]: HotlineCategory } = {
  nationalEmergency: {
    title: "National Emergency Hotline",
    icon: Siren,
    contacts: [
      { name: "All Emergencies", numbers: ["911"] }
    ],
    note: "The primary number for any emergency situation."
  },
  disasterResponse: {
    title: "Disaster & Risk Reduction",
    icon: ShieldAlert,
    contacts: [
      { name: "NDRRMC Operations", numbers: ["(02) 8911-1406", "(02) 8912-2665", "(02) 8912-5668"] },
      { name: "NDRRMC Trunkline", numbers: ["(02) 8911-5061 to 65"] },
    ]
  },
  humanitarianAid: {
    title: "Philippine Red Cross",
    icon: Heart,
    contacts: [
        { name: "Emergency Hotline", numbers: ["143"] },
        { name: "Trunkline", numbers: ["(02) 8790-2300"] },
        { name: "Blood Services", numbers: ["(02) 8527-8385 to 95"] },
    ]
  },
  policeAndFire: {
    title: "Police & Fire",
    icon: Siren,
    contacts: [
      { name: "PNP Emergency", numbers: ["117", "(02) 8722-0650"] },
      { name: "PNP Text Hotline", numbers: ["0917-847-5757"] },
      { name: "Bureau of Fire (BFP)", numbers: ["(02) 8426-0219", "(02) 8426-0246"] },
    ]
  },
  weatherAndHazards: {
      title: "Weather & Natural Hazards",
      icon: CloudRain,
      contacts: [
          { name: "PAGASA", numbers: ["(02) 8284-0800"] },
          { name: "PHIVOLCS", numbers: ["(02) 8426-1468 to 79"] },
      ]
  },
  publicServices: {
    title: "Public Services & Utilities",
    icon: Building,
    contacts: [
      { name: "DSWD", numbers: ["(02) 8931-8101 to 07"] },
      { name: "DSWD Text Hotline", numbers: ["0918-912-2813"] },
      { name: "Philippine Coast Guard", numbers: ["(02) 8527-8481", "0917-724-3682"] },
      { name: "MMDA", numbers: ["136"] },
    ]
  },
};

// Restored list of local hotlines
const localHotlineData: { [key: string]: HotlineCategory } = {
    rizal: {
        title: "Rizal Province",
        icon: MapPin,
        contacts: [
          { name: "Tanay", numbers: ["655-17-73 local 253"] },
          { name: "Montalban", numbers: ["531-61-06"] },
          { name: "Cardona", numbers: ["954-97-28", "0915-612-6631"] },
          { name: "Teresa", numbers: ["0920-972-3731"] },
          { name: "San Mateo", numbers: ["781-68-20"] },
          { name: "Angono", numbers: ["451-17-11"] },
          { name: "Morong", numbers: ["212-57-41", "0926-691-4281"] },
          { name: "Antipolo", numbers: ["234-2676", "734-2470"] },
        ]
    },
    metroManila: {
        title: "Metro Manila",
        icon: MapPin,
        contacts: [
            { name: "San Juan City", numbers: ["8238-43-33"] },
            { name: "Paranaque City", numbers: ["8829-09-22"] },
            { name: "Muntinlupa City", numbers: ["8925-43-51"] },
            { name: "Valenzuela City", numbers: ["8292-14-05", "0915-2598376"] },
            { name: "Makati City", numbers: ["8870-11-91", "8870-14-60"] },
            { name: "Caloocan (South)", numbers: ["8288-77-17"] },
            { name: "Caloocan (North)", numbers: ["8277-28-85"] },
            { name: "Mandaluyong City", numbers: ["8532-21-89", "8532-24-02"] },
            { name: "Marikina City", numbers: ["8646-24-36", "8646-24-26"] },
            { name: "Pasig City", numbers: ["8632-00-99"] },
            { name: "Pateros", numbers: ["8642-51-59"] },
            { name: "Manila", numbers: ["8927-13-35", "8978-53-12"] },
            { name: "Taguig City", numbers: ["0917-550-3727"] },
            { name: "Pasay City Rescue", numbers: ["8833-8512", "8551-7777"] },
        ],
        note: "For Metro Manila landlines, add '8' at the beginning if not already included."
    },
    bulacan: {
        title: "Bulacan Province",
        icon: MapPin,
        contacts: [
          { name: "Meycauayan Rescue", numbers: ["(044)323-04-04", "0915-707-7929"] },
          { name: "Malolos Red Cross", numbers: ["(044)662-59-22"] },
          { name: "Calumpit Rescue", numbers: ["(044)913-72-95", "0923-401-4305"] },
          { name: "Hagonoy Rescue", numbers: ["(044)793-58-11", "0925-885-5811"] },
        ]
    },
};

const HotlineCard: React.FC<HotlineCategory> = ({ title, icon: Icon, contacts, note }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
            <Icon size={14} className="mr-2" />
            {title}
        </h3>
        {note && <p className="text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-md">{note}</p>}
        <div className="space-y-3">
            {contacts.map((contact, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center text-sm pt-3 border-t border-slate-100 first:pt-0 first:border-none"
                >
                    <span className="text-slate-600 pr-2">{contact.name}</span>
                    <div className="text-right flex flex-col items-end flex-shrink-0">
                        {contact.numbers.map((num) => (
                            <a 
                              key={num} 
                              href={`tel:${num.replace(/[^0-9]/g, '')}`} 
                              className="font-bold text-slate-800 flex items-center space-x-1.5 hover:text-cyan-600 transition-colors py-0.5"
                            >
                                <Phone size={12} />
                                <span>{num}</span>
                            </a>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);


export default function HotlinesView() {
  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="bg-cyan-50 border-l-4 border-cyan-500 text-cyan-800 p-4 rounded-r-lg mb-2">
          <h3 className="font-bold">National Emergency Contacts</h3>
          <p className="text-sm">For nationwide emergencies and public services.</p>
      </div>
      {Object.values(nationalHotlineData).map(data => <HotlineCard key={data.title} {...data} />)}
      
      <div className="bg-slate-50 border-l-4 border-slate-500 text-slate-800 p-4 rounded-r-lg mt-8 mb-2">
          <h3 className="font-bold">Local Area Hotlines</h3>
          <p className="text-sm">Contacts for specific provinces and cities. For other local concerns, please check your LGU&apos;s official announcements.</p>
      </div>
      {Object.values(localHotlineData).map(data => <HotlineCard key={data.title} {...data} />)}
    </div>
  );
}