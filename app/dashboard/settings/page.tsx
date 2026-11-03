import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/lib/types";
import SettingsClient from "./settings-client";

export const dynamic = "force-dynamic";

export default async function DashboardSettings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*")
    .eq("user_id", user!.id)
    .maybeSingle();

  return <SettingsClient vendor={vendor as Vendor} />;
}
