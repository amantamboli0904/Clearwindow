export function LoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading air quality data"
      className="space-y-4 animate-pulse"
    >
      <div className="rounded-3xl border-[1.5px] border-neutral-300 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900 sm:p-8">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="space-y-3">
            <div className="h-3.5 w-44 rounded-md bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-10 w-56 rounded-lg bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-4 w-80 max-w-full rounded-md bg-neutral-100 dark:bg-neutral-800/70" />
          </div>
          <div className="h-24 w-48 rounded-2xl bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-48 rounded-3xl border-[1.5px] border-neutral-300 bg-[#1CE0FF]/25 p-6 dark:border-neutral-800 dark:bg-neutral-900" />
        <div className="h-48 rounded-3xl border-[1.5px] border-neutral-300 bg-neutral-900/10 p-6 dark:border-neutral-800 dark:bg-neutral-900" />
      </div>

      <div className="rounded-3xl border-[1.5px] border-neutral-300 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-5 w-36 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        <div className="mt-6 h-52 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800/60" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-28 rounded-2xl border-[1.5px] border-neutral-300 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="mt-5 h-6 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
