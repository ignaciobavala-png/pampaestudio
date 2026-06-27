export interface AdminClass {
  name: string;
  type: "Yoga" | "Pilates";
  room: string;
  teacher: string;
  time: string;
  end: string;
  taken: number;
  max: number;
  color: string;
  att: [string, string, string, string][];  // [name, pack, avColor, initials]
  wl: [string, string, string, string][];   // [name, avColor, initials, since]
}

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  pack: string;
  packId: string | null;
  credits: number;
  classes: number;
  av: string;
  ini: string;
  since: string;
  isApproved: boolean;
}

export interface AdminPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  period: string;
}
