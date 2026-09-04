import { CheckCircle2, Code2, LoaderCircle, Search, X } from 'lucide-react';
import { LeetCodeSync } from './leetcode-sync';

type TrackerHeaderProps = {
  isLoading: boolean;
  query: string;
  solvedCount: number;
  totalCount: number;
  onQueryChange: (query: string) => void;
  onLeetCodeSync: (
    acceptedIds: number[],
  ) => Promise<{ addedCount: number; matchedCount: number }>;
};

export function TrackerHeader({
  isLoading,
  onLeetCodeSync,
  onQueryChange,
  query,
  solvedCount,
  totalCount,
}: TrackerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_22px_oklch(0.62_0.19_253/22%)]">
            <Code2 size={20} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-heading text-lg font-bold leading-none">
              Interview Atlas
            </p>
            <p className="mt-1 hidden text-xs text-muted-foreground sm:block">
              Your algorithm field guide
            </p>
          </div>
        </div>

        <SearchInput
          className="hidden w-full max-w-md md:flex"
          query={query}
          onQueryChange={onQueryChange}
        />

        <div className="flex shrink-0 items-center gap-2">
          <LeetCodeSync onSync={onLeetCodeSync} />
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-bold">
            {isLoading ? (
              <LoaderCircle size={16} className="animate-spin text-primary" />
            ) : (
              <CheckCircle2 size={16} className="text-primary" />
            )}
            <span>
              {solvedCount}
              <span className="hidden text-muted-foreground sm:inline">
                {' '}
                / {totalCount} solved
              </span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SearchInput({
  className = '',
  onQueryChange,
  query,
}: Pick<TrackerHeaderProps, 'query' | 'onQueryChange'> & {
  className?: string;
}) {
  return (
    <label
      className={`${className} items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm shadow-inner`}
    >
      <Search size={16} className="text-muted-foreground" />
      <span className="sr-only">Search current chapter</span>
      <input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search this chapter"
        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          aria-label="Clear search"
        >
          <X size={15} />
        </button>
      )}
    </label>
  );
}
