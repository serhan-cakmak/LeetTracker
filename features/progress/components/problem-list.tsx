import { ExternalLink, LoaderCircle, Search } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import type { ProblemFilter } from '@/features/progress/types';
import type { Chapter, Difficulty } from '@/features/study-plan/data';
import { SearchInput } from './tracker-header';

const difficultyClasses: Record<Difficulty, string> = {
  Easy: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  Hard: 'bg-rose-100 text-rose-800',
};

type ProblemListProps = {
  chapter: Chapter;
  filter: ProblemFilter;
  query: string;
  savingIds: number[];
  solvedIds: number[];
  onFilterChange: (filter: ProblemFilter) => void;
  onQueryChange: (query: string) => void;
  onSolvedChange: (problemId: number, solved: boolean) => Promise<unknown>;
};

export function ProblemList({
  chapter,
  filter,
  onFilterChange,
  onQueryChange,
  onSolvedChange,
  query,
  savingIds,
  solvedIds,
}: ProblemListProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const problems = chapter.problems.filter((problem) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'solved'
        ? solvedIds.includes(problem.id)
        : !solvedIds.includes(problem.id));
    const matchesQuery =
      !normalizedQuery ||
      problem.title.toLowerCase().includes(normalizedQuery) ||
      String(problem.id).includes(normalizedQuery);

    return matchesFilter && matchesQuery;
  });
  const difficultyTotals = chapter.problems.reduce(
    (totals, problem) => {
      totals[problem.difficulty] += 1;
      return totals;
    },
    { Easy: 0, Medium: 0, Hard: 0 } as Record<Difficulty, number>,
  );

  return (
    <section className="mt-9" aria-labelledby="practice-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Practice set
          </p>
          <h2 id="practice-heading" className="mt-1 text-2xl font-bold">
            Problems to master
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {difficultyTotals.Easy} easy · {difficultyTotals.Medium} medium ·{' '}
            {difficultyTotals.Hard} hard
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Problem status"
          className="flex rounded-xl border border-border bg-card p-1"
        >
          {(['all', 'unsolved', 'solved'] as ProblemFilter[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={filter === value}
              onClick={() => onFilterChange(value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${filter === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      <SearchInput
        className="mt-4 flex md:hidden"
        query={query}
        onQueryChange={onQueryChange}
      />

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {problems.length ? (
          problems.map((problem) => {
            const isSolved = solvedIds.includes(problem.id);
            const isSaving = savingIds.includes(problem.id);

            return (
              <div
                key={problem.id}
                className="group flex items-start gap-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-muted/55 sm:items-center sm:gap-4 sm:px-5"
              >
                <Checkbox
                  checked={isSolved}
                  disabled={isSaving}
                  onCheckedChange={(checked) =>
                    void onSolvedChange(problem.id, checked)
                  }
                  aria-label={`Mark ${problem.title} as ${isSolved ? 'unsolved' : 'solved'}`}
                  className="mt-0.5 sm:mt-0"
                />
                <span className="w-9 shrink-0 pt-0.5 font-mono text-sm text-muted-foreground sm:pt-0">
                  {problem.id}
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`https://leetcode.com/problems/${problem.slug}/`}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline ${isSolved ? 'text-muted-foreground line-through' : ''}`}
                  >
                    {problem.title}
                    <ExternalLink
                      size={13}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </a>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    <span className="font-bold text-foreground/75">
                      Technique ·{' '}
                    </span>
                    {problem.note}
                  </p>
                  {problem.memoryCue && (
                    <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-relaxed text-rose-950">
                      <span className="mr-2 font-mono text-xs font-bold uppercase tracking-wider text-rose-700">
                        Memorise
                      </span>
                      {problem.memoryCue}
                    </p>
                  )}
                </div>
                {isSaving ? (
                  <LoaderCircle
                    size={16}
                    className="mt-1 shrink-0 animate-spin text-primary sm:mt-0"
                  />
                ) : (
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {problem.memoryCue && (
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
                        Specific pattern
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${difficultyClasses[problem.difficulty]}`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="px-5 py-12 text-center">
            <Search size={24} className="mx-auto text-muted-foreground" />
            <p className="mt-3 font-semibold">No problems match this view</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another status or clear your search.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
