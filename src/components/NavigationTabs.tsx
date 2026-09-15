import React from 'react';
import { LayoutDashboard, CheckSquare, History, TableProperties } from 'lucide-react';

export type TabKey = 'beranda' | 'absensi' | 'riwayat' | 'rekap';

interface NavigationTabsProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  sessionCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  sessionCount,
}) => {
  const tabs = [
    { id: 'beranda' as TabKey, label: 'Beranda', icon: LayoutDashboard },
    { id: 'absensi' as TabKey, label: 'Input Absensi', icon: CheckSquare },
    {
      id: 'riwayat' as TabKey,
      label: 'Riwayat Absen',
      icon: History,
      badge: sessionCount > 0 ? sessionCount : undefined,
    },
    { id: 'rekap' as TabKey, label: 'Rekap Absen', icon: TableProperties },
  ];

  return (
    <div className="flex border-b border-slate-200 bg-white px-4 sm:px-6 rounded-xl shadow-xs overflow-x-auto no-scrollbar gap-1 sm:gap-2">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 py-3.5 px-3 sm:px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              isActive
                ? 'border-blue-700 text-blue-800'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-semibold ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
