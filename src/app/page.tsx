"use client";

import { useState } from 'react';
import { Home, Map, HeartHandshake } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import views
const HomeView = dynamic(() => import('../components/HomeView'));
const MapView = dynamic(() => import('../components/MapView'), { ssr: false });
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
      className={`flex flex-col items-center justify-center w-full h-16 transition-colors duration-300 ${activeView === view ? 'text-cyan-600' : 'text-slate-500 hover:text-cyan-500'
        }`}
    >
      <Icon size={24} className={activeView === view ? 'scale-110' : ''} />
      <span className="text-xs mt-1 font-semibold">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white p-4 z-10 sticky top-0 flex items-center justify-center border-b border-slate-100">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-800">Ahon Montalban</h1>
          <p className="text-sm text-slate-500">Rodriguez, Rizal Flood Response</p>
        </div>
      </header>

      <main className="flex-grow overflow-y-auto bg-slate-50 mb-24">
        {renderView()}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto p-2 z-50 bg-transparent">
        <nav className="flex justify-around bg-white/70 backdrop-blur-lg rounded-full shadow-lg border border-slate-100">
          <NavItem view="home" icon={Home} label="Home" />
          <NavItem view="map" icon={Map} label="Flood Map" />
          <NavItem view="aid" icon={HeartHandshake} label="Community Aid" />
        </nav>
      </footer>
    </div>
  );
}