"use client";

import { useState } from 'react';
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
  
  const params = useParams();
  const location = (params.location as string) || 'montalban';
  
  const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1);

  const handleViewOnMap = (coords: { lat: number; lng: number }) => {
    setMapCenter(coords);
    setActiveView('map');
  };

  const handleEditFromMap = () => {
    setActiveView('list');
  };

  const renderView = () => {
    switch (activeView) {
      case 'map':
        return <MapView location={location} mapCenter={mapCenter} onEditFromMap={handleEditFromMap} />;
      case 'aid':
        return <AidView location={location} />;
      case 'hotlines':
        return <HotlinesView />;
      case 'list':
        return <ListView location={location} onViewOnMap={handleViewOnMap} />;
      case 'home':
      default:
        return <HomeView location={location} />;
    }
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
        {renderView()}
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