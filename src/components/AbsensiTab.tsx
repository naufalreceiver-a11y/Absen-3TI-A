import React, { useState, useEffect } from 'react';
import { Check, Clock, Calendar, BookOpen, User, Layers, Search, CheckCircle2, HelpCircle } from 'lucide-react';
import { Course, Student, AttendanceStatus, AttendanceRecord } from '../types';
import { toTitleCase, getStatusBadgeClasses } from '../utils/helpers';

interface AbsensiTabProps {
  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
  initialCourseCode?: string;
  onSaveAttendance: (newRecords: AttendanceRecord[]) => void;
  onShowMessage: (title: string, message: string, isConfirm?: boolean, callback?: () => void) => void;
}

export const AbsensiTab: React.FC<AbsensiTabProps> = ({
  students,
  courses,
  records,
  initialCourseCode,
  onSaveAttendance,
  onShowMessage,
}) => {
  const [selectedCourseCode, setSelectedCourseCode] = useState<string>(
    initialCourseCode || (courses[0]?.code ?? '')
  );
  const [meetingType, setMeetingType] = useState<'Online' | 'Offline'>('Offline');
  const [meetingNumber, setMeetingNumber] = useState<string>('1');
  const [date, setDate] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [timeIn, setTimeIn] = useState<string>('08:00');
  const [timeOut, setTimeOut] = useState<string>('10:00');
  const [material, setMaterial] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Attendance state: studentId -> AttendanceStatus
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});

  // Reset or initialize student statuses
  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      initial[s.id] = 'Hadir';
    });
    setAttendance(initial);
  }, [students]);

  // Sync if initialCourseCode passed from dashboard
  useEffect(() => {
    if (initialCourseCode) {
      setSelectedCourseCode(initialCourseCode);
    }
  }, [initialCourseCode]);

  const currentCourse = courses.find(c => c.code === selectedCourseCode) || courses[0];

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSetAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      updated[s.id] = status;
    });
    setAttendance(updated);
  };

  const handleSave = () => {
    if (!selectedCourseCode) {
      onShowMessage('Peringatan', 'Silakan pilih mata kuliah terlebih dahulu.');
      return;
    }
    if (!date) {
      onShowMessage('Peringatan', 'Silakan tentukan tanggal perkuliahan.');
      return;
    }

    // Check duplicate session
    const isDuplicate = records.some(
      r =>
        r.courseCode === selectedCourseCode &&
        String(r.meeting) === String(meetingNumber) &&
        r.date === date
    );

    const performSave = () => {
      const now = Date.now();
      const newEntries: AttendanceRecord[] = students.map(s => ({
        id: s.id,
        name: s.name,
        courseCode: selectedCourseCode,
        courseName: currentCourse.name,
        lecturer: currentCourse.lecturer,
        meeting: meetingNumber,
        date: date,
        type: meetingType,
        status: attendance[s.id] || 'Hadir',
        material: material.trim(),
        timeIn: meetingType === 'Offline' ? timeIn : undefined,
        timeOut: meetingType === 'Offline' ? timeOut : undefined,
        timestamp: now,
      }));

      onSaveAttendance(newEntries);
    };

    if (isDuplicate) {
      onShowMessage(
        'Peringatan Duplikasi',
        `Data absensi untuk ${currentCourse.name} Pertemuan ke-${meetingNumber} pada tanggal ${date} sudah ada. Apakah Anda ingin tetap menyimpannya sebagai sesi baru?`,
        true,
        performSave
      );
    } else {
      performSave();
    }
  };

  // Status counts
  const hadirCount = Object.values(attendance).filter(s => s === 'Hadir').length;
  const izinCount = Object.values(attendance).filter(s => s === 'Izin').length;
  const sakitCount = Object.values(attendance).filter(s => s === 'Sakit').length;
  const alphaCount = Object.values(attendance).filter(s => s === 'Alpha').length;

  // Filtered student list for search
  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.includes(searchQuery.trim())
  );

  return (
    <div className="space-y-6">
      {/* Session Metadata Form */}
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xs border border-slate-200/80 space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-700" />
            Parameter Pertemuan Perkuliahan
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi data mata kuliah, jenis pertemuan, dan topik materi pembelajaran hari ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Mata Kuliah */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700">
              Mata Kuliah
            </label>
            <select
              id="sel-course"
              value={selectedCourseCode}
              onChange={e => setSelectedCourseCode(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {courses.map(c => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          {/* Dosen */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nama Dosen Pengampu
            </label>
            <input
              id="inp-lecturer"
              type="text"
              value={currentCourse?.lecturer || ''}
              readOnly
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-slate-50 text-slate-700 font-medium cursor-not-allowed"
            />
          </div>

          {/* Pertemuan Ke */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              Pertemuan Ke-
            </label>
            <select
              id="sel-meeting"
              value={meetingNumber}
              onChange={e => setMeetingNumber(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                <option key={num} value={String(num)}>
                  Pertemuan {num}
                </option>
              ))}
            </select>
          </div>

          {/* Jenis Pertemuan */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700">
              Jenis Pertemuan
            </label>
            <select
              id="sel-meeting-type"
              value={meetingType}
              onChange={e => setMeetingType(e.target.value as 'Online' | 'Offline')}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Offline">Offline (Tatap Muka di Kelas)</option>
              <option value="Online">Online (Daring / Virtual Meet)</option>
            </select>
          </div>

          {/* Tanggal */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Tanggal Perkuliahan
            </label>
            <input
              id="inp-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Jadwal Info Pill */}
          <div>
            <label className="block mb-1.5 text-xs font-semibold text-slate-700">
              Info Jadwal Akademik
            </label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
              <span>{currentCourse?.jadwal}</span>
              <span className="font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                {currentCourse?.sks} SKS
              </span>
            </div>
          </div>

          {/* Offline Hours */}
          {meetingType === 'Offline' && (
            <div id="offline-times" className="md:col-span-2 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Jam Masuk Perkuliahan
                </label>
                <input
                  id="inp-time-in"
                  type="time"
                  value={timeIn}
                  onChange={e => setTimeIn(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Jam Keluar Perkuliahan
                </label>
                <input
                  id="inp-time-out"
                  type="time"
                  value={timeOut}
                  onChange={e => setTimeOut(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* Keterangan Materi */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-1.5 text-xs font-semibold text-slate-700">
              Keterangan Pokok Bahasan / Materi Pembelajaran
            </label>
            <textarea
              id="inp-material"
              value={material}
              onChange={e => setMaterial(e.target.value)}
              placeholder="Contoh: Implementasi state management, hooks, dan arsitektur komponen..."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Student List Control & Status Summary */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Presensi Mahasiswa ({students.length} Mahasiswa)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih status kehadiran masing-masing mahasiswa secara cepat.
            </p>
          </div>

          {/* Quick Bulk Actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1 hidden md:inline">
              Setel Semua:
            </span>
            <button
              onClick={() => handleSetAll('Hadir')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
            >
              Semua Hadir
            </button>
            <button
              onClick={() => handleSetAll('Izin')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100/80 text-amber-800 hover:bg-amber-200 transition cursor-pointer"
            >
              Semua Izin
            </button>
            <button
              onClick={() => handleSetAll('Sakit')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-100/80 text-blue-800 hover:bg-blue-200 transition cursor-pointer"
            >
              Semua Sakit
            </button>
            <button
              onClick={() => handleSetAll('Alpha')}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-rose-100/80 text-rose-800 hover:bg-rose-200 transition cursor-pointer"
            >
              Semua Alpha
            </button>
          </div>
        </div>

        {/* Live Counters Pill & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Hadir: {hadirCount}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Izin: {izinCount}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Sakit: {sakitCount}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              Alpha: {alphaCount}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari NIM / Nama..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Table of students */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900 text-white font-semibold text-xs">
              <tr>
                <th className="p-3 text-center w-12">No</th>
                <th className="p-3 w-32">NIM</th>
                <th className="p-3">Nama Mahasiswa</th>
                <th className="p-3 text-center w-72">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody id="student-tbody" className="divide-y divide-slate-100">
              {filteredStudents.map((s, idx) => {
                const currentStatus = attendance[s.id] || 'Hadir';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 text-center text-xs text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-mono text-xs font-semibold text-slate-700">{s.id}</td>
                    <td className="p-3 font-medium text-slate-800 text-xs sm:text-sm">
                      {toTitleCase(s.name)}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        {(['Hadir', 'Izin', 'Sakit', 'Alpha'] as AttendanceStatus[]).map(st => {
                          const isSelected = currentStatus === st;
                          let activeClass = '';
                          if (isSelected) {
                            if (st === 'Hadir') activeClass = 'bg-emerald-600 text-white shadow-xs font-bold';
                            else if (st === 'Izin') activeClass = 'bg-amber-500 text-white shadow-xs font-bold';
                            else if (st === 'Sakit') activeClass = 'bg-blue-600 text-white shadow-xs font-bold';
                            else if (st === 'Alpha') activeClass = 'bg-rose-600 text-white shadow-xs font-bold';
                          } else {
                            activeClass = 'bg-slate-100 text-slate-600 hover:bg-slate-200/80';
                          }

                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.id, st)}
                              className={`px-2.5 py-1 text-xs rounded-md transition cursor-pointer ${activeClass}`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Save Attendance Submit Button */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Pastikan seluruh mahasiswa telah dicek sebelum menyimpan.
          </span>
          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Absensi Pertemuan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
