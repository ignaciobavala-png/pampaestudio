import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    let profile: Profile | null = null;
    if (user) {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = p;
    }

    set({ user, profile, loading: false, initialized: true });
  },

  signIn: async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };

    const user = data.user;
    let profile: Profile | null = null;
    if (user) {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      profile = p;
    }

    set({ user, profile });
    return { error: null };
  },

  signUp: async (email, password, fullName) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${location.origin}/api/auth/callback`,
      },
    });

    if (error) return { error: error.message };
    return { error: null };
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) return;

    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) set({ profile });
  },

  setUser: (user) => set({ user }),
}));
