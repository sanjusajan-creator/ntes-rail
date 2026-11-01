import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col items-center justify-center px-5 pt-24 text-center sm:px-8">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-white/40">
        <SearchX className="h-6 w-6" />
      </div>
      <h1 className="mt-5 font-display text-3xl font-semibold text-white">Wrong platform</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">
        This page doesn&apos;t exist — maybe it was rerouted. Head back to the main board.
      </p>
      <Link href="/" className="btn-primary mt-6 !px-4 !py-2.5 !text-xs">
        <Home className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}
