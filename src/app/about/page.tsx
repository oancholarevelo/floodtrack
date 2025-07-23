import LegalPageHeader from '../legal/LegalPageHeader';
import { ExternalLink, Target, Code, ShieldAlert } from 'lucide-react';

const InfoCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
            <Icon className="text-cyan-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="text-slate-600 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-slate-50">
      <LegalPageHeader title="About FloodTrack" />
      <main className="flex-grow overflow-y-auto p-4 md:p-6">
        <div className="text-center bg-cyan-600 text-white p-8 rounded-xl mb-6">
            <h1 className="text-3xl font-bold mb-2">Connecting Communities, Ensuring Safety</h1>
            <p className="max-w-2xl mx-auto">
                FloodTrack is a community-driven platform for real-time flood monitoring and assistance during natural calamities.
            </p>
        </div>

        <div className="space-y-6">
            <InfoCard icon={Target} title="Our Mission">
                <p>
                    Our goal is to empower communities with the information they need to stay safe and connected when it matters most. By providing a platform for crowdsourced data, we aim to create a more resilient and prepared society.
                </p>
            </InfoCard>

            <InfoCard icon={Code} title="The Developer">
                <p>
                  This application was developed by <strong>Oliver Revelo</strong> as a tool to help fellow citizens. It is a personal project aimed at leveraging technology for public good and disaster preparedness.
                </p>
                <a 
                  href="https://oliverrevelo.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-slate-800 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <span>View Portfolio</span>
                  <ExternalLink size={16} />
                </a>
            </InfoCard>

            <InfoCard icon={ShieldAlert} title="Disclaimer">
                <p>
                  FloodTrack relies on user-submitted data. While we strive to maintain accuracy, all information should be cross-verified with official government advisories. This app is intended as a supplementary tool, not a replacement for official emergency services.
                </p>
            </InfoCard>
        </div>
      </main>
    </div>
  );
}