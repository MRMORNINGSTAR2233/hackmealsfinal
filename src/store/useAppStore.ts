import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  isLoading: boolean;
  
  // Data loading
  loadParticipants: () => Promise<void>;
  loadAdmins: () => Promise<void>;
  
  // Admin actions
  addAdmin: (admin: Admin) => Promise<boolean>;
  verifyAdmin: (username: string, password: string) => Promise<boolean>;
  
  // Participant actions
  addParticipants: (participants: Omit<Participant, 'id' | 'qrCode' | 'breakfast' | 'lunch' | 'dinner' | 'createdAt'>[]) => Promise<{ success: number; duplicates: number; errors: string[] }>;
  verifyParticipant: (name: string, teamName: string) => Promise<Participant | null>;
  updateMealStatus: (participantId: string, mealType: 'breakfast' | 'lunch' | 'dinner') => Promise<boolean>;
  getParticipant: (qrCode: string) => Promise<Participant | null>;
  
  // Auth actions
  login: (user: { id: string; role: 'admin' | 'participant' }) => void;
  logout: () => void;
  
  // Stats
  getStats: () => { total: number; breakfast: number; lunch: number; dinner: number };
}

export const useAppStore = create<AppState>()((set, get) => ({
  participants: [],
  admins: [],
  currentUser: null,
  isLoading: false,

  loadParticipants: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const participants: Participant[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email || undefined,
        mobile: p.mobile,
        teamName: p.team_name,
        qrCode: p.qr_code,
        breakfast: p.breakfast,
        lunch: p.lunch,
        dinner: p.dinner,
        createdAt: p.created_at,
      }));

      set({ participants, isLoading: false });
    } catch (error) {
      console.error('Failed to load participants:', error);
      set({ isLoading: false });
    }
  },

  loadAdmins: async () => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('username, password');

      if (error) throw error;

      const admins: Admin[] = (data || []).map(a => ({
        username: a.username,
        password: a.password,
      }));

      set({ admins });
    } catch (error) {
      console.error('Failed to load admins:', error);
    }
  },

  addAdmin: async (admin) => {
    try {
      const { error } = await supabase
        .from('admins')
        .insert({ username: admin.username, password: admin.password });

      if (error) throw error;

      set((state) => ({
        admins: [...state.admins, admin]
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to add admin:', error);
      return false;
    }
  },

  verifyAdmin: async (username, password) => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('id, username')
        .eq('username', username)
        .eq('password', password)
        .single();

      if (error || !data) return false;

      return true;
    } catch (error) {
      console.error('Failed to verify admin:', error);
      return false;
    }
  },

  addParticipants: async (newParticipants) => {
    const state = get();
    const errors: string[] = [];
    let duplicates = 0;
    const toAdd: Participant[] = [];

    // Check for existing participants in database
    const { data: existingParticipants } = await supabase
      .from('participants')
      .select('mobile');

    const existingMobiles = new Set((existingParticipants || []).map(p => p.mobile.toLowerCase()));

    for (const p of newParticipants) {
      // Validate required fields
      if (!p.name?.trim() || !p.teamName?.trim() || !p.mobile?.trim()) {
        errors.push(`Missing required fields for entry: ${p.name || 'Unknown'}`);
        continue;
      }

      const mobile = p.mobile.toLowerCase();
      if (existingMobiles.has(mobile)) {
        duplicates++;
        continue;
      }

      const participant: Participant = {
        id: crypto.randomUUID(),
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
    }

    if (toAdd.length > 0) {
      try {
        const { error } = await supabase
          .from('participants')
          .insert(toAdd.map(p => ({
            id: p.id,
            name: p.name,
            email: p.email,
            mobile: p.mobile,
            team_name: p.teamName,
            qr_code: p.qrCode,
            breakfast: p.breakfast,
            lunch: p.lunch,
            dinner: p.dinner,
          })));

        if (error) throw error;

        // Reload participants from database
        await get().loadParticipants();
      } catch (error) {
        console.error('Failed to add participants:', error);
        errors.push('Database error occurred while adding participants');
      }
    }

    return { success: toAdd.length, duplicates, errors };
  },

  verifyParticipant: async (name, teamName) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .ilike('name', name)
        .ilike('team_name', teamName)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        mobile: data.mobile,
        teamName: data.team_name,
        qrCode: data.qr_code,
        breakfast: data.breakfast,
        lunch: data.lunch,
        dinner: data.dinner,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Failed to verify participant:', error);
      return null;
    }
  },

  updateMealStatus: async (participantId, mealType) => {
    try {
      // First check if participant exists and meal is not already marked
      const { data: participant, error: fetchError } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (fetchError || !participant) return false;
      if (participant[mealType]) return false; // Already marked

      const { error } = await supabase
        .from('participants')
        .update({ [mealType]: true })
        .eq('id', participantId);

      if (error) throw error;

      // Update local state immediately
      set((state) => ({
        participants: state.participants.map(p =>
          p.id === participantId ? { ...p, [mealType]: true } : p
        )
      }));

      // Also reload participants to ensure data is in sync
      await get().loadParticipants();

      return true;
    } catch (error) {
      console.error('Failed to update meal status:', error);
      return false;
    }
  },

  getParticipant: async (qrCode) => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('qr_code', qrCode)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email || undefined,
        mobile: data.mobile,
        teamName: data.team_name,
        qrCode: data.qr_code,
        breakfast: data.breakfast,
        lunch: data.lunch,
        dinner: data.dinner,
        createdAt: data.created_at,
      };
    } catch (error) {
      console.error('Failed to get participant:', error);
      return null;
    }
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
}));
