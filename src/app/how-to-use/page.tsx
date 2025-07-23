import LegalPageHeader from '../legal/LegalPageHeader';
import { Home, Map, List, HeartHandshake, Phone, Siren, ShieldPlus, AlertTriangle } from 'lucide-react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-2xl font-bold text-slate-800 mt-8 mb-4">{children}</h2>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-cyan-300">
        <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 bg-cyan-100 text-cyan-700 p-3 rounded-lg mt-1">
                <Icon size={24} />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
                <p className="text-slate-600 text-sm">{description}</p>
            </div>
        </div>
    </div>
);

export default function HowToUsePage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <LegalPageHeader title="How to Use" />
      <main className="flex-1 overflow-y-auto mobile-scroll-container">
        <div className="p-4 md:p-6 pb-8">
        <div className="bg-cyan-50 border-l-4 border-cyan-500 text-cyan-800 p-4 rounded-r-lg mb-6">
            <h3 className="font-bold">Welcome to FloodTrack!</h3>
            <p className="text-sm">Here’s a quick guide to navigating the app and using its features to stay safe and help your community.</p>
        </div>

        <SectionTitle>Navigating the App</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard 
                icon={Home} 
                title="Home"
                description="Get weather updates, see live maps, and view official LGU announcements."
            />
            <FeatureCard 
                icon={Map} 
                title="Flood Map"
                description="View real-time reports of floods and safe areas submitted by the community."
            />
             <FeatureCard 
                icon={List} 
                title="List View"
                description="See a detailed list of all active reports and safe areas, sorted by distance."
            />
            <FeatureCard 
                icon={HeartHandshake} 
                title="Community Aid"
                description="Request essentials or offer help like transport and shelter to others in need."
            />
            <FeatureCard 
                icon={Phone} 
                title="Hotlines"
                description="Quickly access a list of important emergency hotlines."
            />
        </div>

        <SectionTitle>Key Actions</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FeatureCard 
                icon={Siren} 
                title="Report a Flood"
                description="On the Map, tap 'Report Flood', pin the location, and select the water level."
            />
             <FeatureCard 
                icon={ShieldPlus} 
                title="Add a Safe Area"
                description="On the Map, tap 'Add Safe Area', pin the location, and add details like name and capacity."
            />
        </div>
        </div>
      </main>
    </div>
  );
}
