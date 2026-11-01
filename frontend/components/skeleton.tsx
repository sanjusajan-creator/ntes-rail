import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} aria-hidden />;
}

export function CardSkeleton() {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-2.5 w-full" />
        <div className="grid grid-cols-3 gap-3 pt-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function TimelineSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="glass rounded-2xl p-6">
      <Skeleton className="mb-6 h-5 w-40" />
      <div className="space-y-6">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-16 space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
            <div className="relative mt-1 h-3 w-3 shrink-0 rounded-full bg-white/10" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="glass flex items-center justify-between gap-4 rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="hidden h-9 w-24 rounded-lg sm:block" />
        </div>
      ))}
    </div>
  );
}
