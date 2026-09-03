import { Skeleton } from "@/components/ui";

/** Skeletons, never spinners. Mirrors the shape of a list page. */
export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-8" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="mt-3 h-6 w-56" />
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex gap-3 py-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
