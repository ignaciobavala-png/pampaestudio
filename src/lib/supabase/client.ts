import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Singleton: una sola instancia del browser client en toda la app.
// Crear una instancia nueva por llamada genera múltiples GoTrueClient
// compartiendo el mismo lock (Navigator LockManager) -> contención y
// deadlock que cuelga signInWithPassword ("Cargando..." infinito en el login).
let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return browserClient;
}
