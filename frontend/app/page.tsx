import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleCheckBig,
  Clock3,
  Database,
  Gauge,
  MapPin,
  Radar,
  Route,
  Sparkles,
  Ticket,
  TrainFront,
  Waypoints,
  Zap,
} from "lucide-react";
import { HeroSearch } from "@/components/hero-search";
import { SectionHeading } from "@/components/section-heading";
import { LiveClock } from "@/components/live-clock";

const FEATURES = [
  {
    href: "/live",
    icon: Radar,
    title: "Live running status",
    description:
      "Exact position, delay, last reported station and platform for every train currently on the network.",
    accent: "text-saffron",
    ring: "group-hover:border-saffron/30",
  },
  {
    href: "/schedule",
    icon: Route,
    title: "Complete schedules",
    description:
      "Every halt with arrival, departure, day, distance, platform and running days — from source to destination.",
    accent: "text-electric-soft",
    ring: "group-hover:border-electric/30",
  },
  {
    href: "/station",
    icon: MapPin,
    title: "Station live board",
    description:
      "What's arriving and departing in the next few hours, with expected times and delay at a glance.",
    accent: "text-mint",
    ring: "group-hover:border-mint/30",
  },
  {
    href: "/between",
    icon: Waypoints,
    title: "Trains between stations",
    description:
      "Every direct train for a pair of stations, with departure, arrival, duration, classes and running days.",
    accent: "text-electric-soft",
    ring: "group-hover:border-electric/30",
  },
  {
    href: "/pnr",
    icon: Ticket,
    title: "PNR status",
    description:
      "Confirmation, RAC or waitlist for every passenger — with coach and berth. The captcha is solved for you.",
    accent: "text-saffron",
    ring: "group-hover:border-saffron/30",
  },
];

const ROUTES = [
  { from: "NDLS", to: "MMCT", label: "Delhi → Mumbai" },
  { from: "HWH", to: "NDLS", label: "Howrah → New Delhi" },
  { from: "MAS", to: "SBC", label: "Chennai → Bengaluru" },
  { from: "PNBE", to: "NDLS", label: "Patna → New Delhi" },
  { from: "SC", to: "BZA", label: "Secunderabad → Vijayawada" },
  { from: "ADI", to: "MMCT", label: "Ahmedabad → Mumbai" },
];

const STATION_CHIPS = ["NDLS", "HWH", "MAS", "SBC", "MMCT", "PNBE", "BZA", "SC"];

const STATS = [
  { value: "13,000+", label: "trains covered" },
  { value: "7,300+", label: "stations" },
  { value: "68,000", label: "route kilometres" },
  { value: "₹0", label: "forever free" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-saffron/[0.07] blur-[120px]" />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/55 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-saffron" />
              Live NTES data · no signup · no ads
              <LiveClock />
            </div>

            <h1 className="font-display text-4xl font-semibold leading-[1.06] tracking-tight text-white text-balance sm:text-6xl">
              Every train in India,
              <br />
              <span className="gradient-text animate-gradient-pan">in one clear lens.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-white/50 text-pretty sm:text-base">
              Running status, delays, platforms, schedules and PNR — pulled live from Indian
              Railways and wrapped in a fast, modern interface. Free, for everyone.
            </p>

            <div className="mt-9">
              <HeroSearch />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/30">
                Popular
              </span>
              {STATION_CHIPS.slice(0, 6).map((code) => (
                <Link
                  key={code}
                  href={`/station?code=${code}`}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-white/50 transition hover:border-saffron/30 hover:text-saffron-soft"
                >
                  {code}
                </Link>
              ))}
            </div>
          </div>

          {/* Stats strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.06] sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="bg-ink-950/80 px-5 py-6 text-center backdrop-blur">
                <div className="font-display text-2xl font-semibold text-white sm:text-[26px]">
                  {stat.value}
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-white/35">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Everything you need"
            title="Five tools. One clean interface."
            description="Built around the questions travellers actually ask — where is my train, when does it reach, is my seat confirmed, and what's running from this station?"
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.04] ${feature.ring} ${
                    index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon className={`h-[18px] w-[18px] ${feature.accent}`} />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-white/20 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/60" />
                  </div>
                  <h3 className="mt-4 font-display text-[15px] font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/45">
                    {feature.description}
                  </p>
                </Link>
              );
            })}

            <div className="relative overflow-hidden rounded-2xl border border-saffron/20 bg-gradient-to-br from-saffron/[0.12] via-transparent to-electric/[0.08] p-5">
              <div className="flex items-start justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-saffron/25 bg-saffron/10 text-saffron">
                  <Zap className="h-[18px] w-[18px]" />
                </span>
                <span className="chip !border-saffron/20 !text-saffron-soft">Free API</span>
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold text-white">
                Open REST API
              </h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/45">
                Every screen is powered by our own documented API. Build your own dashboard,
                bot or widget on top of it.
              </p>
              <a
                href="/api-docs"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-saffron-soft hover:text-saffron"
              >
                API reference <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Plan a journey"
              title="Trains between popular cities"
              description="Jump straight into every direct train for India's busiest corridors."
            />
            <Link href="/between" className="btn-ghost !text-xs">
              Search any route <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROUTES.map((route) => (
              <Link
                key={`${route.from}-${route.to}`}
                href={`/between?from=${route.from}&to=${route.to}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 transition hover:border-electric/30 hover:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-white/85">{route.label}</div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-white/35">
                    <span>{route.from}</span>
                    <ArrowRight className="h-3 w-3 text-saffron/60" />
                    <span>{route.to}</span>
                  </div>
                </div>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-white/40 transition group-hover:border-electric/30 group-hover:text-electric-soft">
                  <TrainFront className="h-3.5 w-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="relative py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-transparent p-6 sm:p-10">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron">
                  <span className="h-px w-6 bg-saffron/60" />
                  Why RailLens
                </p>
                <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Built like a product, not a form.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  Most railway sites dump raw tables on you. RailLens turns the same public data
                  into a timeline you can read in a glance — on any screen.
                </p>
                <Link href="/live" className="btn-primary mt-6 !px-4 !py-2.5 !text-xs">
                  <Radar className="h-4 w-4" /> Open live radar
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Gauge,
                    title: "Fast by default",
                    body: "Sensible caching keeps repeat lookups instant.",
                  },
                  {
                    icon: Database,
                    title: "Source-transparent",
                    body: "Every number comes straight from NTES.",
                  },
                  {
                    icon: Clock3,
                    title: "Always current",
                    body: "Live data refreshes each time you ask.",
                  },
                  {
                    icon: CircleCheckBig,
                    title: "No account",
                    body: "No login, no ads, no tracking pixels.",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-white/[0.07] bg-ink-950/50 p-4"
                    >
                      <Icon className="h-4 w-4 text-saffron" />
                      <h3 className="mt-2.5 text-[13px] font-semibold text-white">{item.title}</h3>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-white/40">{item.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
