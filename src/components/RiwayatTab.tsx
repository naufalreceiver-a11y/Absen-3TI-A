import React, { useState } from 'react';
import { Download, Trash2, Eye, Calendar, BookOpen, Layers, Filter, Search } from 'lucide-react';
import { Course, AttendanceSession } from '../types';
import { formatDateIndo, generateSessionPDF } from '../utils/helpers';

interface RiwayatTabProps {
  courses: Course[];
  sessions: AttendanceSession[];
  onDeleteSession: (timestamp: number) => void;
  onOpenSessionDetail: (session: AttendanceSession) => void;
  onShowMessage: (title: string, message: string, isConfirm?: boolean, callback?: () => void) => void;
}

export const RiwayatTab: React.FC<RiwayatTabProps> = ({
  courses,
  sessions,
  onDeleteSession,
  onOpenSessionDetail,
  onShowMessage,
}) => {
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterMeeting, setFilterMeeting] = useState<string>('');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  const filteredSessions = sessions.filter(s => {
    if (filterCourse && s.courseCode !== filterCourse) return false;
    if (filterMeeting && String(s.meeting) !== String(filterMeeting)) return false;
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const matchCourse = s.courseName.toLowerCase().includes(q);
      const matchLecturer = s.lecturer.toLowerCase().includes(q);
      const matchMaterial = (s.material || '').toLowerCase().includes(q);
      const matchDate = s.date.includes(q);
      if (!matchCourse && !matchLecturer && !matchMaterial && !matchDate) return false;
    }
    return true;
  });

  const handleDownloadFilteredPDF = () => {
    if (!filterCourse || !filterMeeting) {
      onShowMessage(
        'Peringatan',
        'Silakan pilih Mata Kuliah dan Pertemuan Ke- terlebih dahulu pada filter di atas untuk mengekspor PDF pertemuan tertentu.'
      );
      return;
    }

    const session = sessions.find(
      s => s.courseCode === filterCourse && String(s.meeting) === String(filterMeeting)
    );

    if (!session || session.records.length === 0) {
      onShowMessage('Informasi', 'Data absensi untuk kombinasi mata kuliah dan pertemuan tersebut tidak ditemukan.');
      return;
    }

    generateSessionPDF(session.records);
  };

  const handleDeleteConfirm = (sess: AttendanceSession) => {
    onShowMessage(
      'Konfirmasi Hapus Sesi',
      `Apakah Anda yakin ingin menghapus data absensi ${sess.courseName} Pertemuan ${sess.meeting} tanggal ${sess.date}? Tindakan ini tidak dapat dibatalkan.`,
      true,
      () => onDeleteSession(sess.timestamp)
    );
  };

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Matkul */}
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                id="filt-course"
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
                className="border border-slate-200 rounded-lg p-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Semua Mata Kuliah</option>
                {courses.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Meeting */}
            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                id="filt-meeting"
                value={filterMeeting}
                onChange={e => setFilterMeeting(e.target.value)}
                className="border border-slate-200 rounded-lg p-2 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Semua Pertemuan</option>
                {Array.from({ length: 16 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={String(num)}>
                    Pertemuan {num}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari materi / tanggal..."
                value={searchKeyword}
                onChange={e => setSearchKeyword(e.target.value)}
                className="pl-7 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-52"
              />
            </div>
          </div>

          <button
            onClick={handleDownloadFilteredPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF Absen</span>
          </button>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">
            Daftar Sesi Perkuliahan ({filteredSessions.length} Sesi)
          </h3>
          {(filterCourse || filterMeeting || searchKeyword) && (
            <button
              onClick={() => {
                setFilterCourse('');
                setFilterMeeting('');
                setSearchKeyword('');
              }}
              className="text-xs text-blue-700 hover:underline"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-36">Tanggal</th>
                <th className="p-3.5">Mata Kuliah & Pertemuan</th>
                <th className="p-3.5 w-48">Jenis / Jam</th>
                <th className="p-3.5">Keterangan Materi</th>
                <th className="p-3.5 w-44">Rekapitulasi</th>
                <th className="p-3.5 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody id="riwayat-tbody" className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs sm:text-sm">
                    Tidak ada riwayat absensi yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredSessions.map(sess => {
                  const hadir = sess.records.filter(r => r.status === 'Hadir').length;
                  const izin = sess.records.filter(r => r.status === 'Izin').length;
                  const sakit = sess.records.filter(r => r.status === 'Sakit').length;
                  const alpha = sess.records.filter(r => r.status === 'Alpha').length;

                  return (
                    <tr key={sess.timestamp} className="hover:bg-slate-50/70 transition">
                      <td className="p-3.5 font-medium text-slate-800 text-xs whitespace-nowrap">
                        {formatDateIndo(sess.date)}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900 text-sm">
                          {sess.courseName}
                        </div>
                        <div className="text-xs text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                          <span>Pertemuan Ke-{sess.meeting}</span>
                          <span className="text-slate-400">&bull;</span>
                          <span className="text-slate-500 font-normal">{sess.lecturer}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-slate-600">
                        <span className="inline-block font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 mb-1">
                          {sess.type}
                        </span>
                        {sess.type === 'Offline' && sess.timeIn && (
                          <div className="text-[11px] text-slate-500">
                            {sess.timeIn} - {sess.timeOut || '-'}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-xs text-slate-600 max-w-xs">
                        <p className="line-clamp-2">
                          {sess.material || <span className="text-slate-400 italic">Tanpa keterangan materi</span>}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1 flex-wrap text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                            H: {hadir}
                          </span>
                          {izin > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold text-[11px]">
                              I: {izin}
                            </span>
                          )}
                          {sakit > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[11px]">
                              S: {sakit}
                            </span>
                          )}
                          {alpha > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-semibold text-[11px]">
                              A: {alpha}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenSessionDetail(sess)}
                            title="Lihat Rincian Mahasiswa"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => generateSessionPDF(sess.records)}
                            title="Cetak Berita Acara PDF"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteConfirm(sess)}
                            title="Hapus Sesi Absensi"
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
