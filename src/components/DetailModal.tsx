import React from 'react';
import { X, Download, Calendar, User, Clock, BookOpen } from 'lucide-react';
import { AttendanceSession } from '../types';
import { formatDateIndo, toTitleCase, generateSessionPDF } from '../utils/helpers';

interface DetailModalProps {
  session: AttendanceSession | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ session, onClose }) => {
  if (!session) return null;

  const hadirCount = session.records.filter(r => r.status === 'Hadir').length;
  const izinCount = session.records.filter(r => r.status === 'Izin').length;
  const sakitCount = session.records.filter(r => r.status === 'Sakit').length;
  const alphaCount = session.records.filter(r => r.status === 'Alpha').length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500 text-white">
                Pertemuan {session.meeting}
              </span>
              <span className="text-xs text-blue-200">{session.type}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {session.courseName}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{session.lecturer}</span>
              <span>&bull;</span>
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatDateIndo(session.date)}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Material & Time info */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-2">
            {session.timeIn && (
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">Waktu Perkuliahan:</span>
                <span>{session.timeIn} - {session.timeOut || 'Selesai'}</span>
              </div>
            )}
            <div>
              <span className="font-semibold text-slate-700 block mb-0.5">
                Pokok Bahasan / Materi:
              </span>
              <p className="text-slate-600">
                {session.material || <span className="italic text-slate-400">Tidak ada catatan materi khusus</span>}
              </p>
            </div>
          </div>

          {/* Status summary pill */}
          <div className="flex items-center justify-between gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex-wrap">
            <span className="text-xs font-bold text-blue-900">
              Total: {session.records.length} Mahasiswa
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">
                Hadir: {hadirCount}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800">
                Izin: {izinCount}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800">
                Sakit: {sakitCount}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                Alpha: {alphaCount}
              </span>
            </div>
          </div>

          {/* Student list */}
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 font-semibold text-slate-700">
                <tr>
                  <th className="p-2.5 text-center w-10">No</th>
                  <th className="p-2.5 w-28">NIM</th>
                  <th className="p-2.5">Nama Mahasiswa</th>
                  <th className="p-2.5 text-center w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {session.records.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-2.5 text-center text-slate-400">{i + 1}</td>
                    <td className="p-2.5 font-mono text-slate-600">{r.id}</td>
                    <td className="p-2.5 font-medium text-slate-800">{toTitleCase(r.name)}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          r.status === 'Hadir'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Izin'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'Sakit'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => generateSessionPDF(session.records)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Berita Acara PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
