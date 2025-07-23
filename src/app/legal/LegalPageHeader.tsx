"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface LegalPageHeaderProps {
  title: string;
}

export default function LegalPageHeader({ title }: LegalPageHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white px-4 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] z-[2000] sticky top-0 flex items-center justify-between border-b border-slate-100">
      {/* Back Button */}
      <button 
        onClick={() => router.back()} 
        className="p-2 rounded-full hover:bg-slate-100 transition-colors"
        aria-label="Go back"
      >
        <ArrowLeft size={24} className="text-slate-600" />
      </button>
      
      {/* Logo and Title Group (Right-aligned) */}
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          <p className="text-sm text-slate-500">Legal Information</p>
        </div>
        <Image src="/logo.png" alt="FloodTrack Logo" width={40} height={40} priority />
      </div>
    </header>
  );
}