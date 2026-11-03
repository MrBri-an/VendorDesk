import Link from "next/link";

export default function Landing() {
  return (
    <main className="relative overflow-hidden">
      {/* ---------- Hero ---------- */}
      <section className="grain relative bg-ink text-paper">
        <div className="dotgrid absolute inset-0" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-5 pt-6 pb-20 sm:px-8">
          <header className="flex items-center justify-between py-4">
            <span className="font-display text-xl font-bold tracking-tight">
              Vendor<span className="text-leaf">Desk</span>
            </span>
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-paper/80 transition hover:bg-white/10 hover:text-paper"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-papaya px-4 py-2 font-semibold text-ink shadow-lift transition hover:bg-papaya-deep"
              >
                Open your shop
              </Link>
            </nav>
          </header>

          <div className="stagger grid items-center gap-12 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:pt-20">
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-4 py-1.5 text-sm font-medium text-leaf">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-leaf" />
                Built for Nigerian vendors
              </p>
              <h1 className="font-display text-5xl leading-[0.95] font-extrabold tracking-tight sm:text-7xl">
                Your shop,
                <br />
                on <span className="text-leaf">WhatsApp</span>
                <span className="text-papaya">.</span>
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-paper/70">
                Stop losing orders in the DMs. Get one link with your full
                catalog — customers order 24/7, money lands in your account,
                and every order arrives as a clean WhatsApp message.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="rounded-2xl bg-papaya px-7 py-4 font-display text-lg font-bold text-ink shadow-lift transition hover:-translate-y-0.5 hover:bg-papaya-deep"
                >
                  Open your shop free →
                </Link>
                <span className="text-sm text-paper/50">
                  10-minute setup · No card required
                </span>
              </div>
            </div>

            {/* Phone mock — the memorable bit */}
            <div className="justify-self-center lg:justify-self-end">
              <div className="w-72 rotate-2 rounded-[2.2rem] border-4 border-ink-2 bg-paper text-ink shadow-lift transition-transform duration-500 hover:rotate-0 sm:w-80">
                <div className="flex items-center gap-3 rounded-t-[1.8rem] bg-forest px-5 py-4 text-paper">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-display text-lg font-extrabold text-ink">
                    M
                  </div>
                  <div>
                    <p className="font-display font-bold leading-tight">
                      Mama Chidinma Kitchen
                    </p>
                    <p className="text-xs text-paper/70">
                      Jollof · Suya · Cold drinks
                    </p>
                  </div>
                  <span className="ml-auto h-2.5 w-2.5 animate-pulse rounded-full bg-leaf" />
                </div>
                <div className="space-y-3 px-4 py-4">
                  {[
                    ["Party Jollof + Chicken", "₦3,500"],
                    ["Asun Tray (Small)", "₦5,000"],
                    ["Chapman 50cl", "₦800"],
                  ].map(([name, price], i) => (
                    <div
                      key={name}
                      className="flex items-center gap-3 rounded-xl border border-ink/10 bg-white px-3 py-2.5"
                    >
                      <div
                        className={`h-11 w-11 shrink-0 rounded-lg ${
                          ["bg-gold/80", "bg-papaya/70", "bg-leaf/60"][i]
                        }`}
                      />
                      <p className="flex-1 text-sm font-semibold leading-tight">
                        {name}
                      </p>
                      <p className="text-sm font-bold">{price}</p>
                    </div>
                  ))}
                  <div className="rounded-xl bg-leaf px-4 py-3 text-center font-display font-bold text-ink">
                    Order on WhatsApp →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Three steps. That&apos;s it.
        </h2>
        <div className="stagger mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Add your products",
              d: "Photos, prices, availability. Change something? Customers see it instantly.",
            },
            {
              n: "02",
              t: "Share one link",
              d: "Drop it in your Instagram bio, WhatsApp status, or broadcast list. That link is your shop.",
            },
            {
              n: "03",
              t: "Get orders & money",
              d: "Orders arrive as clean WhatsApp messages. Customers can pay you directly by card or transfer.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="group rounded-3xl border border-ink/10 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="font-display text-sm font-extrabold text-papaya">
                {s.n}
              </span>
              <h3 className="mt-3 font-display text-xl font-bold">{s.t}</h3>
              <p className="mt-2 leading-relaxed text-ink/60">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Pricing ---------- */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grain relative overflow-hidden rounded-[2.5rem] bg-ink px-6 py-14 text-paper sm:px-14">
          <div className="dotgrid absolute inset-0" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
                Less than ₦120 per day.
              </h2>
              <p className="mt-4 max-w-md text-paper/70">
                One missed order usually costs more than a whole month of
                VendorDesk. Start free, pay only when your shop is earning for
                you.
              </p>
              <Link
                href="/signup"
                className="mt-8 inline-block rounded-2xl bg-leaf px-7 py-4 font-display text-lg font-bold text-ink shadow-lift transition hover:-translate-y-0.5"
              >
                Start free — no card needed
              </Link>
            </div>
            <div className="rounded-3xl bg-paper p-8 text-ink">
              <p className="font-display text-sm font-bold tracking-widest text-papaya uppercase">
                Vendor plan
              </p>
              <p className="mt-3 font-display text-5xl font-extrabold">
                ₦3,500
                <span className="text-lg font-semibold text-ink/50">/month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Unlimited products & orders",
                  "Your own storefront link",
                  "Paystack checkout built in",
                  "Order dashboard & sales stats",
                  "WhatsApp support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="mt-0.5 font-bold text-leaf-deep">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 py-8 text-center text-sm text-ink/50">
        VendorDesk · Made for Nigerian sellers ·{" "}
        <Link href="/signup" className="font-semibold text-ink underline">
          Open your shop
        </Link>
      </footer>
    </main>
  );
}
