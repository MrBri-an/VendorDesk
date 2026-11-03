import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("slug, shop_name, logo_url")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            {vendor.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendor.logo_url}
                alt=""
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest font-display text-sm font-extrabold text-paper">
                {vendor.shop_name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="hidden font-display font-bold sm:block">
              {vendor.shop_name}
            </span>
          </Link>

          <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2 transition hover:bg-ink/5"
            >
              Orders
            </Link>
            <Link
              href="/dashboard/products"
              className="rounded-lg px-3 py-2 transition hover:bg-ink/5"
            >
              Products
            </Link>
            <Link
              href="/dashboard/settings"
              className="rounded-lg px-3 py-2 transition hover:bg-ink/5"
            >
              Settings
            </Link>
            <Link
              href={`/${vendor.slug}`}
              target="_blank"
              className="ml-1 hidden rounded-lg bg-leaf px-3 py-2 text-ink transition hover:opacity-90 sm:block"
            >
              View store ↗
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
