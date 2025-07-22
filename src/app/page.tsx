"use client";

import { useState } from 'react';
import { Home, Map, HeartHandshake, Phone } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

// Dynamically import views
const HomeView = dynamic(() => import('../components/HomeView'));
const MapView = dynamic(() => import('../components/MapView'), { ssr: false });
const AidView = dynamic(() => import('../components/AidView'));
const HotlinesView = dynamic(() => import('../components/HotlinesView'));

type View = 'home' | 'map' | 'aid' | 'hotlines';

export default function Page() {
  const [activeView, setActiveView] = useState<View>('home');

  const renderView = () => {
    switch (activeView) {
      case 'map':
        return <MapView />;
      case 'aid':
        return <AidView />;
      case 'hotlines':
        return <HotlinesView />;
      case 'home':
      default:
        return <HomeView />;
    }
  };

  const mainContainerClass = activeView === 'map'
    ? 'flex-grow' // No scroll or padding for the map view
    : 'flex-grow overflow-y-auto pb-24'; // Scroll and padding for other views

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: React.ElementType, label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center w-full h-16 transition-colors duration-300 ${activeView === view ? 'text-cyan-600' : 'text-slate-500 hover:text-cyan-500'
        }`}
    >
      <Icon size={24} className={activeView === view ? 'scale-110' : ''} />
      <span className="text-xs mt-1 font-semibold">{label}</span>
    </button>
  );

  return (
    // FIX: Added 'relative' to ensure absolutely positioned children are contained correctly
    <div className="flex flex-col h-screen relative">
      <header className="bg-white px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] z-[60] sticky top-0 flex items-center justify-center border-b border-slate-100">
        {/* FIX: Added logo and updated layout for it */}
        <div className="text-center flex flex-col items-center">
          <Image src="/logo.png" alt="Ahon Montalban Logo" width={40} height={40} className="mb-1" priority />
          <h1 className="text-xl font-bold text-slate-800">Ahon Montalban</h1>
          <p className="text-sm text-slate-500">Rodriguez, Rizal Flood Response</p>
        </div>
      </header>

      {/* FIX: Main container class is now conditional based on the active view */}
      <main className={`${mainContainerClass} bg-slate-50`}>
        {renderView()}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] z-50 bg-transparent">
        <nav className="flex justify-around bg-white/70 backdrop-blur-lg rounded-full shadow-lg border border-slate-100">
          <NavItem view="home" icon={Home} label="Home" />
          <NavItem view="map" icon={Map} label="Flood Map" />
          <NavItem view="aid" icon={HeartHandshake} label="Community Aid" />
          <NavItem view="hotlines" icon={Phone} label="Hotlines" />
        </nav>
      </footer>
    </div>
  );
}