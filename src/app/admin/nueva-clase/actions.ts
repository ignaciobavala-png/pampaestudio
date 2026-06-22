"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

export async function createClassTemplate(data: {
  name: string;
  discipline: "Yoga" | "Pilates";
  teacher: string;
  room: string;
  day_of_week: number;
  time_start: string;
  time_end: string;
  max_capacity: number;
  description: string | null;
}) {
  const cookieStore = await cookies();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    return { error: "No autenticado" };
  }

  const { error } = await supabase.from("class_templates").insert({
    ...data,
    created_by: userData.user.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin");
  return { error: null };
}
