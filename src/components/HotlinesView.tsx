"use client";

import { Phone, Users, Shield, Heart, LucideIcon } from 'lucide-react';

// Define TypeScript interfaces for our data structures
interface Contact {
  name: string;
  numbers: string[];
}

interface HotlineCardProps {
  title: string;
  icon: LucideIcon;
  contacts: Contact[];
}

// Data has been updated to use a consistent `numbers` array for easier mapping.
const hotlineData = {
  rodriguez: {
    title: "Rodriguez, Rizal",
    icon: Shield,
    contacts: [
      { name: "Emergency Hotline", numbers: ["531-61-06"] },
    ]
  },
  rizal: {
    title: "Rizal Province",
    icon: Users,
    contacts: [
      { name: "Tanay", numbers: ["655-17-73 local 253"] },
      { name: "Cardona", numbers: ["954-97-28", "0915-612-6631"] },
      { name: "Teresa", numbers: ["0920-972-3731"] },
      { name: "San Mateo", numbers: ["781-68-20"] },
      { name: "Angono", numbers: ["451-17-11"] },
      { name: "Morong", numbers: ["212-57-41", "0926-691-4281"] },
      { name: "Antipolo", numbers: ["234-2676", "734-2470"] },
    ]
  },
  redCross: {
    title: "Red Cross Hotlines",
    icon: Heart,
    contacts: [
      { name: "National Hotline", numbers: ["366-03-80"] },
      { name: "Caloocan", numbers: ["366-03-80"] },
      { name: "Paranaque", numbers: ["836-47-90"] },
      { name: "Mandaluyong", numbers: ["571-98-98", "986-99-52"] },
      { name: "Manila", numbers: ["527-21-61", "527-35-95"] },
      { name: "Makati", numbers: ["403-62-67", "403-58-26"] },
      { name: "Quezon City", numbers: ["0917-854-2956"] },
      { name: "Valenzuela", numbers: ["432-02-73"] },
    ]
  },
  metroManila: {
    title: "Metro Manila (Add '8' at the beginning)",
    icon: Users,
    contacts: [
        { name: "San Juan City", numbers: ["238-43-33"] },
        { name: "Paranaque City", numbers: ["829-09-22"] },
        { name: "Muntinlupa City", numbers: ["925-43-51"] },
        { name: "Valenzuela City", numbers: ["292-14-05", "0915-2598376"] },
        { name: "Makati City", numbers: ["870-11-91", "870-14-60"] },
        { name: "Caloocan (South)", numbers: ["288-77-17"] },
        { name: "Caloocan (North)", numbers: ["277-28-85"] },
        { name: "Mandaluyong City", numbers: ["532-21-89", "532-24-02"] },
        { name: "Marikina City", numbers: ["646-24-36", "646-24-26"] },
        { name: "Pasig City", numbers: ["632-00-99"] },
        { name: "Pateros", numbers: ["642-51-59"] },
        { name: "Manila", numbers: ["927-13-35", "978-53-12"] },
        { name: "Taguig City", numbers: ["0917-550-3727"] },
        { name: "Pasay City Rescue", numbers: ["833-8512", "551-7777"] },
    ]
  },
   bulacan: {
    title: "Bulacan Province",
    icon: Users,
    contacts: [
      { name: "Meycauayan Rescue", numbers: ["(044)323-04-04", "0915-707-7929", "0925-707-7929"] },
      { name: "Malolos Red Cross", numbers: ["(044)662-59-22"] },
      { name: "Calumpit Rescue", numbers: ["(044)913-72-95", "0923-401-4305", "0916-390-3931"] },
      { name: "Hagonoy Rescue", numbers: ["(044)793-58-11", "0925-885-5811"] },
    ]
  },
};

const HotlineCard: React.FC<HotlineCardProps> = ({ title, icon: Icon, contacts }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center">
            <Icon size={14} className="mr-2" />
            {title}
        </h3>
        <div className="space-y-3">
            {contacts.map((contact: Contact, index: number) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center text-sm pt-3 border-t border-slate-100 first:pt-0 first:border-none"
                >
                    <span className="text-slate-600 pr-2">{contact.name}</span>
                    <div className="text-right flex flex-col items-end flex-shrink-0">
                        {contact.numbers.map((num: string) => (
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
    // FIX: Reverted to original state. The parent <main> will handle scrolling and padding.
    <div className="p-4 space-y-4">
      <HotlineCard {...hotlineData.rodriguez} />
      <HotlineCard {...hotlineData.rizal} />
      <HotlineCard {...hotlineData.redCross} />
      <HotlineCard {...hotlineData.metroManila} />
      <HotlineCard {...hotlineData.bulacan} />
    </div>
  );
}