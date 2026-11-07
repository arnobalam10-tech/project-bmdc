"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startAttempt(fd: FormData) {
  const setId = String(fd.get("set_id"));
  const mode = fd.get("mode") === "exam" ? "exam" : "practice";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("start_attempt", { p_set_id: setId, p_mode: mode });
  if (error || !data) redirect(`/mcq?locked=1`);
  redirect(`/mcq/attempt/${data}`);
}
