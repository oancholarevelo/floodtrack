"use client";

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Home, Map, HeartHandshake, Phone, List } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Interfaces for props
interface LocationProps {
  location: string;
  coordinates?: { lat: number; lon: number };
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

// Dynamic imports
const HomeView = dynamic<LocationProps>(() => import('../../components/HomeView'));
const MapView = dynamic<MapViewProps>(() => import('../../components/MapView'), { ssr: false });
const AidView = dynamic<Omit<LocationProps, 'coordinates'>>(() => import('../../components/AidView'));
const HotlinesView = dynamic(() => import('../../components/HotlinesView'));
const ListView = dynamic<ListViewProps>(() => import('../../components/ListView'));

type View = 'home' | 'map' | 'aid' | 'hotlines' | 'list';

function LocationPageContent() {
  const [activeView, setActiveView] = useState<View>('home');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const params = useParams();
  const searchParams = useSearchParams();
  const location = (params.location as string) || 'default';

  // State for dynamic coordinates from URL
  const [currentCoordinates, setCurrentCoordinates] = useState<{ lat: number; lon: number } | undefined>();

  useEffect(() => {
    // Read coordinates from URL search params
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (lat && lng) {
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);
      setCurrentCoordinates({ lat: parsedLat, lon: parsedLng });
      setUserLocation({ lat: parsedLat, lng: parsedLng });
    }
  }, [searchParams]);

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
    ? 'flex-1' // Use flex-1 to fill available space
    : 'flex-1 overflow-y-auto'; // Use flex-1 and allow scrolling

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
      <header className="bg-white px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] z-20 flex-shrink-0 flex items-center justify-start border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="FloodTrack Logo" width={40} height={40} priority />
          <div>
            <h1 className="text-xl font-bold text-slate-800">FloodTrack</h1>
            <p className="text-sm text-slate-500">{formattedLocation} Flood Response</p>
          </div>
        </div>
      </header>

      <main className={`${mainContainerClass} bg-slate-50`}>
        {activeView === 'home' && <HomeView location={location} coordinates={currentCoordinates} />}
        {activeView === 'map' && <MapView location={location} mapCenter={mapCenter} onEditFromMap={handleEditFromMap} />}
        {activeView === 'aid' && <AidView location={location} />}
        {activeView === 'hotlines' && <HotlinesView />}
        {activeView === 'list' && <ListView location={location} onViewOnMap={handleViewOnMap} userLocation={userLocation} />}
      </main>

      <footer className="flex-shrink-0 z-20 bg-transparent">
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

// Wrap the component in Suspense because useSearchParams requires it.
export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LocationPageContent />
    </Suspense>
  );
}