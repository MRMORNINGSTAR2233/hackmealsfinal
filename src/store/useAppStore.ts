import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Participant {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  teamName: string;
  qrCode: string;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  createdAt: string;
}

export interface Admin {
  username: string;
  password: string;
}

interface AppState {
  participants: Participant[];
  admins: Admin[];
  currentUser: { id: string; role: 'admin' | 'participant' } | null;
  
  // Admin actions
  addAdmin: (admin: Admin) => void;
  verifyAdmin: (username: string, password: string) => boolean;
  
  // Participant actions
  addParticipants: (participants: Omit<Participant, 'id' | 'qrCode' | 'breakfast' | 'lunch' | 'dinner' | 'createdAt'>[]) => { success: number; duplicates: number; errors: string[] };
  verifyParticipant: (name: string, teamName: string) => Participant | null;
  updateMealStatus: (participantId: string, mealType: 'breakfast' | 'lunch' | 'dinner') => boolean;
  getParticipant: (qrCode: string) => Participant | null;
  
  // Auth actions
  login: (user: { id: string; role: 'admin' | 'participant' }) => void;
  logout: () => void;
  
  // Stats
  getStats: () => { total: number; breakfast: number; lunch: number; dinner: number };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      participants: [],
      admins: [{ username: 'admin', password: 'admin123' }], // Default admin
      currentUser: null,

      addAdmin: (admin) => set((state) => ({
        admins: [...state.admins, admin]
      })),

      verifyAdmin: (username, password) => {
        const admin = get().admins.find(
          (a) => a.username === username && a.password === password
        );
        return !!admin;
      },

      addParticipants: (newParticipants) => {
        const state = get();
        const existingMobiles = new Set(state.participants.map(p => p.mobile.toLowerCase()));
        const errors: string[] = [];
        let duplicates = 0;
        const toAdd: Participant[] = [];

        newParticipants.forEach((p) => {
          // Validate required fields
          if (!p.name?.trim() || !p.teamName?.trim() || !p.mobile?.trim()) {
            errors.push(`Missing required fields for entry: ${p.name || 'Unknown'}`);
            return;
          }

          const mobile = p.mobile.toLowerCase();
          if (existingMobiles.has(mobile)) {
            duplicates++;
            return;
          }

          const participant: Participant = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: p.name.trim(),
            email: p.email?.trim(),
            mobile: p.mobile.trim(),
            teamName: p.teamName.trim(),
            qrCode: `HACK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            breakfast: false,
            lunch: false,
            dinner: false,
            createdAt: new Date().toISOString(),
          };

          toAdd.push(participant);
          existingMobiles.add(mobile);
        });

        if (toAdd.length > 0) {
          set((state) => ({
            participants: [...state.participants, ...toAdd]
          }));
        }

        return { success: toAdd.length, duplicates, errors };
      },

      verifyParticipant: (name, teamName) => {
        const participant = get().participants.find(
          (p) => p.name.toLowerCase() === name.toLowerCase() && 
                 p.teamName.toLowerCase() === teamName.toLowerCase()
        );
        return participant || null;
      },

      updateMealStatus: (participantId, mealType) => {
        const state = get();
        const participant = state.participants.find(p => p.id === participantId);
        
        if (!participant) return false;
        if (participant[mealType]) return false; // Already marked

        set((state) => ({
          participants: state.participants.map(p =>
            p.id === participantId ? { ...p, [mealType]: true } : p
          )
        }));

        return true;
      },

      getParticipant: (qrCode) => {
        return get().participants.find(p => p.qrCode === qrCode) || null;
      },

      login: (user) => set({ currentUser: user }),
      
      logout: () => set({ currentUser: null }),

      getStats: () => {
        const participants = get().participants;
        return {
          total: participants.length,
          breakfast: participants.filter(p => p.breakfast).length,
          lunch: participants.filter(p => p.lunch).length,
          dinner: participants.filter(p => p.dinner).length,
        };
      },
    }),
    {
      name: 'hackathon-storage',
    }
  )
);
