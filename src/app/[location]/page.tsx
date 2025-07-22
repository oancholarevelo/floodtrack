// src/app/[location]/page.tsx

"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Home, Map, HeartHandshake, Phone, List } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

interface LocationProps {
  location: string;
}

interface MapViewProps {
    location: string;
    mapCenter?: { lat: number; lng: number };
    onEditFromMap: () => void;
}

interface ListViewProps {
    location: string;
    onViewOnMap: (coords: { lat: number; lng: number }) => void;
    userLocation: { lat: number; lng: number } | null;
}

const HomeView = dynamic<LocationProps>(() => import('../../components/HomeView'));
const MapView = dynamic<MapViewProps>(() => import('../../components/MapView'), { ssr: false });
const AidView = dynamic<LocationProps>(() => import('../../components/AidView'));
const HotlinesView = dynamic(() => import('../../components/HotlinesView'));
const ListView = dynamic<ListViewProps>(() => import('../../components/ListView'));

type View = 'home' | 'map' | 'aid' | 'hotlines' | 'list';

export default function Page() {
  const [activeView, setActiveView] = useState<View>('home');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const params = useParams();
  const location = (params.location as string) || 'montalban';
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      });
    }
  }, []);

  const formattedLocation = location
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const handleViewOnMap = (coords: { lat: number; lng: number }) => {
    setMapCenter(coords);
    setActiveView('map');
  };

  const handleEditFromMap = () => {
    setActiveView('list');
  };

  const mainContainerClass = activeView === 'map'
    ? 'flex-grow'
    : 'flex-grow overflow-y-auto pb-24';

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      aria-label={label}
      className={`flex-1 flex flex-col items-center justify-center h-full py-2 transition-all duration-300 group relative ${
        activeView === view ? 'text-cyan-600' : 'text-slate-500 hover:text-cyan-600'
      }`}
    >
      <Icon size={28} className="transition-transform duration-300 group-hover:scale-110" />
    </button>
  );

  return (
    <div className="flex flex-col h-screen relative">
      <header className="bg-white px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] z-[2000] sticky top-0 flex items-center justify-start border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="FloodTrack Logo" width={40} height={40} priority />
          <div>
            <h1 className="text-xl font-bold text-slate-800">FloodTrack</h1>
            <p className="text-sm text-slate-500">{formattedLocation} Flood Response</p>
          </div>
        </div>
      </header>

      <main className={`${mainContainerClass} bg-slate-50`}>
        {activeView === 'home' && <HomeView location={location} />}
        {activeView === 'map' && <MapView location={location} mapCenter={mapCenter} onEditFromMap={handleEditFromMap} />}
        {activeView === 'aid' && <AidView location={location} />}
        {activeView === 'hotlines' && <HotlinesView />}
        {activeView === 'list' && <ListView location={location} onViewOnMap={handleViewOnMap} userLocation={userLocation} />}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 z-[2000] bg-transparent">
        <div className="max-w-md mx-auto p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <nav className="flex justify-around bg-white/80 backdrop-blur-lg rounded-2xl shadow-t-lg border border-slate-100 overflow-hidden h-16">
            <NavItem view="home" icon={Home} label="Home" />
            <NavItem view="map" icon={Map} label="Flood Map" />
            <NavItem view="list" icon={List} label="List View" />
            <NavItem view="aid" icon={HeartHandshake} label="Community Aid" />
            <NavItem view="hotlines" icon={Phone} label="Hotlines" />
          </nav>
        </div>
      </footer>
    </div>
  );
}
