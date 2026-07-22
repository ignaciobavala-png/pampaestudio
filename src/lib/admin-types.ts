export interface AdminClass {
  templateId: string;
  name: string;
  type: "Yoga" | "Pilates";
  room: string;
  teacher: string;
  time: string;
  end: string;
  taken: number;
  max: number;
  color: string;
  att: AdminStudent[];
  wl: [string, string, string, string][];   // [name, avColor, initials, since]
}

export interface AdminStudent {
  bookingId: string;
  userId: string;
  name: string;
  pack: string;
  avColor: string;
  initials: string;
  medicalNotes: string;
}

export interface ClientOption {
  id: string;
  name: string;
}

export interface TemplateOption {
  id: string;
  name: string;
  dayOfWeek: number;
  timeStart: string;   // "HH:MM"
  discipline: string;
}

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  pack: string;
  packId: string | null;
  userPackId: string | null;
  packStatus: string | null;     // 'active' | 'frozen' | 'expired'
  packExpiresAt: string | null;
  credits: number;
  classes: number;
  av: string;
  ini: string;
  since: string;
  isApproved: boolean;
  medicalNotes: string;
  experienceLevel: string | null;
}

export interface ClientHistoryItem {
  id: string;
  date: string;
  status: string;
  className: string;
  time: string;
}

export interface AdminPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  period: string;
}
