import LegalPageHeader from '../legal/LegalPageHeader';
import { CheckSquare, AlertTriangle, ShieldOff } from 'lucide-react';

const Section = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <div className="mt-8">
        <div className="flex items-center space-x-3 mb-3">
            <Icon className="text-cyan-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">{title}</h2>
        </div>
        <div className="pl-10 space-y-3 text-slate-600 border-l-2 border-slate-200 ml-3">{children}</div>
    </div>
);

export default function TermsOfUsePage() {
  return (
    <div className="flex flex-col bg-white">
      <LegalPageHeader title="Terms of Use" />
      <main className="flex-grow overflow-y-auto p-6 md:p-8">
        <p className="text-sm text-slate-500 mb-6">Last Updated: July 23, 2025</p>
        
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">Summary of Key Points</h3>
            <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                <li>Use the app responsibly and do not post false information.</li>
                <li>Information is crowdsourced and not guaranteed to be 100% accurate.</li>
                <li>Always prioritize official government advisories.</li>
                <li>The app is provided &quot;as is,&quot; and we are not liable for any damages from its use.</li>
            </ul>
        </div>

        <Section icon={CheckSquare} title="Responsible Use">
            <p>This platform is for community assistance. You agree not to misuse the service by submitting false alarms, using inappropriate language, or spamming.</p>
            <p>False reports can cause panic and divert resources from those in need. All posts are subject to a profanity filter.</p>
        </Section>

        <Section icon={AlertTriangle} title="Disclaimer of Warranties">
            <p>Information on FloodTrack is crowdsourced and provided &quot;as is&quot; without guarantees of accuracy. It is a supplementary tool and should not replace official emergency services.</p>
            <p>Always verify critical information with official sources like PAGASA and NDRRMC before taking action.</p>
        </Section>

        <Section icon={ShieldOff} title="Limitation of Liability">
            <p>Your use of any information on this website is entirely at your own risk. In no event shall FloodTrack or its creators be liable for any damages arising from the use or inability to use the service.</p>
        </Section>
      </main>
    </div>
  );
}