export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpha';

export interface Student {
  id: string; // NIM
  name: string;
}

export interface Course {
  code: string;
  name: string;
  lecturer: string;
  sks: number;
  jadwal: string;
}

export interface AttendanceRecord {
  id: string; // NIM
  name: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  meeting: string | number;
  date: string;
  type: 'Online' | 'Offline';
  status: AttendanceStatus;
  material: string;
  timeIn?: string;
  timeOut?: string;
  timestamp: number;
}

export interface AttendanceSession {
  timestamp: number;
  courseCode: string;
  courseName: string;
  lecturer: string;
  meeting: string;
  date: string;
  type: 'Online' | 'Offline';
  material: string;
  timeIn?: string;
  timeOut?: string;
  records: AttendanceRecord[];
}
