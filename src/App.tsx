import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabKey } from './components/NavigationTabs';
import { DashboardTab } from './components/DashboardTab';
import { AbsensiTab } from './components/AbsensiTab';
import { RiwayatTab } from './components/RiwayatTab';
import { RekapTab } from './components/RekapTab';
import { DetailModal } from './components/DetailModal';
import { CustomModal } from './components/CustomModal';
import { STUDENTS, COURSES, SAMPLE_INITIAL_RECORDS } from './data/initialData';
import { AttendanceRecord, AttendanceSession } from './types';

const STORAGE_KEY = 'simak_records';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('beranda');
  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return SAMPLE_INITIAL_RECORDS;
  });

  const [preselectedCourse, setPreselectedCourse] = useState<string | undefined>();
  const [detailSession, setDetailSession] = useState<AttendanceSession | null>(null);

  // Modal notification / confirmation state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isConfirm: boolean;
    callback: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isConfirm: false,
    callback: null,
  });

  // Save to localStorage when records change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }, [records]);

  // Derive grouped sessions sorted by newest first
  const sessions: AttendanceSession[] = useMemo(() => {
    const sessionMap = new Map<number, AttendanceRecord[]>();
    records.forEach(r => {
      const list = sessionMap.get(r.timestamp) || [];
      list.push(r);
      sessionMap.set(r.timestamp, list);
    });

    const result: AttendanceSession[] = [];
    sessionMap.forEach((recs, ts) => {
      if (recs.length > 0) {
        const first = recs[0];
        result.push({
          timestamp: ts,
          courseCode: first.courseCode,
          courseName: first.courseName,
          lecturer: first.lecturer,
          meeting: String(first.meeting),
          date: first.date,
          type: first.type,
          material: first.material,
          timeIn: first.timeIn,
          timeOut: first.timeOut,
          records: recs,
        });
      }
    });

    // Sort descending by timestamp or date
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [records]);

  const showMessage = (
    title: string,
    message: string,
    isConfirm: boolean = false,
    callback: (() => void) | null = null
  ) => {
    setModalState({
      isOpen: true,
      title,
      message,
      isConfirm,
      callback,
    });
  };

  const handleModalConfirm = () => {
    if (modalState.callback) {
      modalState.callback();
    }
    setModalState(prev => ({ ...prev, isOpen: false, callback: null }));
  };

  const handleModalCancel = () => {
    setModalState(prev => ({ ...prev, isOpen: false, callback: null }));
  };

  const handleSaveAttendance = (newRecords: AttendanceRecord[]) => {
    setRecords(prev => [...prev, ...newRecords]);
    showMessage('Sukses', 'Data absensi perkuliahan berhasil disimpan!');
    setTimeout(() => {
      setActiveTab('riwayat');
    }, 400);
  };

  const handleDeleteSession = (timestamp: number) => {
    setRecords(prev => prev.filter(r => r.timestamp !== timestamp));
    showMessage('Dihapus', 'Data sesi absensi telah berhasil dihapus dari sistem.');
  };

  const handleResetData = () => {
    showMessage(
      'Konfirmasi Reset',
      'Apakah Anda yakin ingin memulihkan data absensi awal kelas 3TI-A?',
      true,
      () => {
        setRecords(SAMPLE_INITIAL_RECORDS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_RECORDS));
      }
    );
  };

  const handleStartAttendanceWithCourse = (courseCode?: string) => {
    if (courseCode) {
      setPreselectedCourse(courseCode);
    }
    setActiveTab('absensi');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['DM_Sans',sans-serif]">
      {/* Header */}
      <Header onResetData={handleResetData} recordCount={records.length} />

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          sessionCount={sessions.length}
        />

        {/* Tab Panels */}
        <div className="mt-2">
          {/* Panel Beranda */}
          <div id="panel-beranda" className={activeTab === 'beranda' ? 'block' : 'hidden'}>
            <DashboardTab
              students={STUDENTS}
              courses={COURSES}
              records={records}
              sessions={sessions}
              onStartAttendance={handleStartAttendanceWithCourse}
              onViewHistory={() => setActiveTab('riwayat')}
              onOpenSessionDetail={setDetailSession}
            />
          </div>

          {/* Panel Absensi */}
          <div id="panel-absensi" className={activeTab === 'absensi' ? 'block' : 'hidden'}>
            <AbsensiTab
              students={STUDENTS}
              courses={COURSES}
              records={records}
              initialCourseCode={preselectedCourse}
              onSaveAttendance={handleSaveAttendance}
              onShowMessage={showMessage}
            />
          </div>

          {/* Panel Riwayat */}
          <div id="panel-riwayat" className={activeTab === 'riwayat' ? 'block' : 'hidden'}>
            <RiwayatTab
              courses={COURSES}
              sessions={sessions}
              onDeleteSession={handleDeleteSession}
              onOpenSessionDetail={setDetailSession}
              onShowMessage={showMessage}
            />
          </div>

          {/* Panel Rekap */}
          <div id="panel-rekap" className={activeTab === 'rekap' ? 'block' : 'hidden'}>
            <RekapTab
              students={STUDENTS}
              courses={COURSES}
              records={records}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} SIMAK - Sistem Informasi Absensi Kelas 3TI-A</span>
          <span className="text-slate-400">Teknik Informatika &bull; Roster 21 Mahasiswa</span>
        </div>
      </footer>

      {/* Detail Modal */}
      <DetailModal
        session={detailSession}
        onClose={() => setDetailSession(null)}
      />

      {/* Notification / Confirm Modal */}
      <CustomModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        isConfirm={modalState.isConfirm}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />
    </div>
  );
}
