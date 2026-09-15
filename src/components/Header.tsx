import React from 'react';
import { ClipboardCheck, GraduationCap, Calendar } from 'lucide-react';

interface HeaderProps {
  onResetData: () => void;
  recordCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onResetData, recordCount }) => {
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white shadow-md border-b border-blue-800/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600/90 flex items-center justify-center shadow-inner border border-blue-400/30">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                  SIMAK - Absensi Kelas 3TI-A
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-200 border border-blue-400/30">
                  Semester 5
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200/90 flex items-center gap-1.5 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Teknik Informatika &bull; Tahun Akademik 2026/2027</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="flex items-center gap-2 text-xs bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{today}</span>
            </div>

            <button
              onClick={onResetData}
              title="Pulihkan data sampel awal"
              className="text-xs bg-blue-800/40 hover:bg-blue-700/60 px-2.5 py-1.5 rounded-lg border border-blue-700/50 text-blue-200 transition cursor-pointer"
            >
              Reset Data Default
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
