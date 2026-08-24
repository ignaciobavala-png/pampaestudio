import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// El registro no termina con la cuenta creada: falta confirmar el mail. Y
// Supabase, para no filtrar qué direcciones ya existen, devuelve 200 con un
// user vacío cuando el mail ya está registrado (identities = []) en vez de un
// error. Distinguir los tres casos es lo que evita el "creé la cuenta y no
// puedo entrar".
export type SignUpResult = {
  error: string | null;
  needsConfirmation: boolean;
  alreadyRegistered: boolean;
};

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<SignUpResult>;
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
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user ?? null;

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
    } catch {
      set({ loading: false, initialized: true });
    }
  },

  signIn: async (email, password) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };

    // Seteamos el user y devolvemos enseguida. El profile se carga en segundo
    // plano: encadenar una query PostgREST justo después de signInWithPassword
    // en el browser client puede quedar colgada (deadlock del LockManager),
    // y no debe bloquear el redirect. El rol se revalida server-side en el
    // middleware al entrar a /admin.
    set({ user: data.user, loading: false, initialized: true });
    void get().refreshProfile();
    return { error: null };
  },

  signUp: async (email, password, fullName) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        // /auth/confirm (token_hash), no /api/auth/callback (PKCE): el mail
        // se puede abrir en otro dispositivo.
        emailRedirectTo: `${location.origin}/auth/confirm`,
      },
    });

    if (error) {
      return { error: error.message, needsConfirmation: false, alreadyRegistered: false };
    }

    // Mail ya registrado: Supabase devuelve un user "fantasma" sin identities.
    const alreadyRegistered = (data.user?.identities?.length ?? 0) === 0;

    // Sin session, la cuenta existe pero está sin confirmar: no puede entrar
    // hasta abrir el link del mail.
    const needsConfirmation = !data.session;

    return { error: null, needsConfirmation, alreadyRegistered };
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null, loading: false });
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

  setUser: (user) => set({ user, profile: user ? get().profile : null, loading: false }),
}));
