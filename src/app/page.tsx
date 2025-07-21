"use client";

import { useState } from 'react';
import { Home, Map, HeartHandshake } from 'lucide-react';

// Dynamically import components to improve initial load time and handle client-side dependencies
import dynamic from 'next/dynamic';

const HomeView = dynamic(() => import('../components/HomeView'));
const MapView = dynamic(() => import('../components/MapView'), { ssr: false }); // Leaflet map requires client-side rendering
const AidView = dynamic(() => import('../components/AidView'));

type View = 'home' | 'map' | 'aid';

export default function Page() {
  const [activeView, setActiveView] = useState<View>('home');

  const renderView = () => {
    switch (activeView) {
      case 'map':
        return <MapView />;
      case 'aid':
        return <AidView />;
      case 'home':
      default:
        return <HomeView />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        activeView === view ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
      }`}
    >
      <Icon size={24} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md z-10">
        <h1 className="text-xl font-bold text-center">Community Flood Watch</h1>
        <p className="text-center text-sm text-blue-200">Rodriguez, Rizal</p>
      </header>

      <main className="flex-grow overflow-y-auto pb-20">
        {renderView()}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white border-t border-gray-200 shadow-t-lg z-10">
        <nav className="flex justify-around">
          <NavItem view="home" icon={Home} label="Home" />
          <NavItem view="map" icon={Map} label="Flood Map" />
          <NavItem view="aid" icon={HeartHandshake} label="Community Aid" />
        </nav>
      </footer>
    </div>
  );
}