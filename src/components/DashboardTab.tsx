import React from 'react';
import { Users, BookOpen, FileCheck, Award, ArrowRight, Download, CalendarClock, CheckCircle2 } from 'lucide-react';
import { Course, Student, AttendanceRecord, AttendanceSession } from '../types';
import { formatDateIndo, generateSessionPDF } from '../utils/helpers';

interface DashboardTabProps {
  students: Student[];
  courses: Course[];
  records: AttendanceRecord[];
  sessions: AttendanceSession[];
  onStartAttendance: (courseCode?: string) => void;
  onViewHistory: () => void;
  onOpenSessionDetail: (session: AttendanceSession) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  students,
  courses,
  records,
  sessions,
  onStartAttendance,
  onViewHistory,
  onOpenSessionDetail,
}) => {
  // Calculate stats
  const totalStudents = students.length;
  const totalCourses = courses.length;
  const totalRecords = records.length;
  const totalSessions = sessions.length;

  const hadirCount = records.filter(r => r.status === 'Hadir').length;
  const attendanceRate = totalRecords > 0 ? Math.round((hadirCount / totalRecords) * 100) : 100;

  const recentSessions = sessions.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Top Banner / Call to Action */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
            Sistem Aktif & Terhubung
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Presensi Mahasiswa Semester Ganjil 3TI-A
          </h2>
          <p className="text-sm text-blue-200/90 max-w-2xl">
            Kelola absensi 21 mahasiswa untuk 8 mata kuliah, pantau statistik kehadiran perkuliahan, dan cetak berita acara resmi dalam format PDF standar akademik.
          </p>
        </div>
        <button
          onClick={() => onStartAttendance()}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl text-sm transition shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
        >
          <span>Mulai Absensi Baru</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Mahasiswa</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2" id="dash-students">
            {totalStudents}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Rombel Aktif 3TI-A</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mata Kuliah</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2" id="dash-courses">
            {totalCourses}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">8 Dosen Pengampu</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Entri Absen</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2" id="dash-records">
            {totalRecords}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Dari {totalSessions} sesi pertemuan</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rata-rata Hadir</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-800 mt-2">
            {attendanceRate}%
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Tingkat kepatuhan kelas</span>
        </div>
      </div>

      {/* Two Column Layout: Schedule & Recent Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule / Courses list */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-blue-600" />
                Daftar Mata Kuliah & Dosen Pengampu
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih mata kuliah untuk segera melakukan absensi pertemuan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map(c => (
              <div
                key={c.code}
                className="group p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-400/80 hover:bg-blue-50/30 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {c.code}
                    </span>
                    <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {c.sks} SKS
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm mt-2 group-hover:text-blue-700 transition line-clamp-1">
                    {c.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{c.lecturer}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    {c.jadwal}
                  </span>
                  <button
                    onClick={() => onStartAttendance(c.code)}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-800 group-hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Absen</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Recent Sessions */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">Sesi Absensi Terakhir</h3>
              <button
                onClick={onViewHistory}
                className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
              >
                Semua ({sessions.length})
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentSessions.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada sesi absensi yang tercatat.
                </div>
              ) : (
                recentSessions.map(sess => {
                  const hadir = sess.records.filter(r => r.status === 'Hadir').length;
                  const izin = sess.records.filter(r => r.status === 'Izin').length;
                  const sakit = sess.records.filter(r => r.status === 'Sakit').length;
                  const alpha = sess.records.filter(r => r.status === 'Alpha').length;

                  return (
                    <div key={sess.timestamp} className="py-3 first:pt-1 last:pb-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-blue-700">
                            P{sess.meeting} &bull; {sess.type}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-800 leading-tight">
                            {sess.courseName}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatDateIndo(sess.date)}
                          </p>
                        </div>
                        <button
                          onClick={() => generateSessionPDF(sess.records)}
                          title="Download PDF Berita Acara"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 border border-slate-200 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium text-[11px]">
                          H: {hadir}
                        </span>
                        {izin > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium text-[11px]">
                            I: {izin}
                          </span>
                        )}
                        {sakit > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium text-[11px]">
                            S: {sakit}
                          </span>
                        )}
                        {alpha > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 font-medium text-[11px]">
                            A: {alpha}
                          </span>
                        )}
                        <button
                          onClick={() => onOpenSessionDetail(sess)}
                          className="ml-auto text-[11px] text-slate-500 hover:text-blue-700 underline cursor-pointer"
                        >
                          Rincian
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={() => onStartAttendance()}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer mt-4"
          >
            + Input Absensi Perkuliahan
          </button>
        </div>
      </div>
    </div>
  );
};
