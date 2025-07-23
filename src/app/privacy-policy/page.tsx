import LegalPageHeader from '../legal/LegalPageHeader';
import { Database, MapPin, User, Shield, Trash2 } from 'lucide-react';

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="mt-8">
        <div className="flex items-center space-x-3 mb-3">
            <Icon className="text-cyan-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="pl-10 space-y-3 text-slate-600 border-l-2 border-slate-200 ml-3">{children}</div>
    </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col h-screen bg-white">
      <LegalPageHeader title="Privacy Policy" />
      <main className="flex-grow overflow-y-auto p-6 md:p-8">
        <p className="text-sm text-slate-500 mb-6">Last Updated: July 23, 2025</p>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">Summary of Key Points</h3>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>We collect location data and user-submitted content to power the app.</li>
                <li>This data is displayed publicly to help the community.</li>
                <li>We use third-party services like Google Firebase for data storage.</li>
                <li>You can request the deletion of your posts.</li>
            </ul>
        </div>

        <Section icon={MapPin} title="Information We Collect">
            <p><strong>Location Data:</strong> When you report a flood, add a safe area, or use the SOS feature, we collect your geographical coordinates to display this information publicly on the map.</p>
            <p><strong>User-Submitted Content:</strong> We collect information you provide in aid requests/offers, such as the title, location details, and contact info you choose to share.</p>
        </Section>

        <Section icon={User} title="How We Use Information">
            <p>Your information is used to display real-time reports on our public map, connect users who need help, and analyze usage to improve the app.</p>
        </Section>

        <Section icon={Database} title="Data Storage & Third Parties">
            <p>All user data is stored on Google Firebase. We also use WeatherAPI, Geoapify, and Windy.com to provide weather and map-related services.</p>
        </Section>

        <Section icon={Trash2} title="Your Rights & Data Deletion">
            <p>You have the right to request the deletion of your posts. Use the delete button on any item to flag it for admin review and permanent removal.</p>
        </Section>
      </main>
    </div>
  );
}
