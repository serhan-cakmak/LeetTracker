'use client';

import {
  AlertCircle,
  Binary,
  BookOpenCheck,
  Braces,
  CheckCircle2,
  Code2,
  ExternalLink,
  GitBranch,
  Layers3,
  ListTree,
  LoaderCircle,
  Network,
  Rows3,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { chapters, totalProblemCount } from '@/lib/study-data';

type Filter = 'all' | 'unsolved' | 'solved';

type ModelContext = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations?: { readOnlyHint?: boolean; untrustedContentHint?: boolean };
      execute: (input: unknown) => unknown;
    },
    options?: { signal?: AbortSignal },
  ) => void | Promise<void>;
};

const chapterIcons = [Braces, Rows3, Layers3, Binary, ListTree, GitBranch, Sparkles, Network, BookOpenCheck];

function difficultyClass(difficulty: string) {
  if (difficulty === 'Easy') return 'bg-emerald-100 text-emerald-800';
  if (difficulty === 'Hard') return 'bg-rose-100 text-rose-800';
  return 'bg-amber-100 text-amber-800';
}

export default function Home() {
  const [activeId, setActiveId] = useState('arrays');
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const solvedRef = useRef<number[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [syncError, setSyncError] = useState(false);

  const activeChapter = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];

  const loadProgress = useCallback(() => {
    return fetch('/api/progress')
      .then((response) => {
        if (!response.ok) throw new Error('Progress request failed');
        return response.json() as Promise<{ solvedIds?: number[] }>;
      })
      .then((data) => {
        const loadedIds = Array.isArray(data.solvedIds) ? data.solvedIds : [];
        solvedRef.current = loadedIds;
        setSolvedIds(loadedIds);
        setSyncError(false);
      })
      .catch(() => setSyncError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const setProblemSolved = useCallback(async (questionId: number, solved: boolean) => {
    const previous = solvedRef.current;
    const next = solved ? [...new Set([...previous, questionId])] : previous.filter((id) => id !== questionId);
    solvedRef.current = next;
    setSolvedIds(next);
    setSavingIds((current) => [...current, questionId]);

    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, solved }),
      });
      if (!response.ok) throw new Error('Save request failed');
      setSyncError(false);
      return { questionId, solved, status: 'saved' as const };
    } catch {
      solvedRef.current = previous;
      setSolvedIds(previous);
      setSyncError(true);
      throw new Error('Progress could not be saved. Try again.');
    } finally {
      setSavingIds((current) => current.filter((id) => id !== questionId));
    }
  }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const allProblemIds = new Set(chapters.flatMap((chapter) => chapter.problems.map((problem) => problem.id)));

    const register = async () => {
      await context.registerTool({
        name: 'set_problem_solved',
        title: 'Update problem progress',
        description: 'Mark one interview-practice problem as solved or unsolved and save the new progress.',
        inputSchema: {
          type: 'object',
          properties: {
            questionId: { type: 'integer', description: 'The LeetCode problem number.' },
            solved: { type: 'boolean', description: 'Whether the problem is solved.' },
          },
          required: ['questionId', 'solved'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        async execute(input) {
          const value = input as { questionId?: unknown; solved?: unknown };
          if (!Number.isInteger(value.questionId) || typeof value.solved !== 'boolean' || !allProblemIds.has(value.questionId as number)) {
            throw new Error('Use a valid problem number from the study plan and a boolean solved value.');
          }
          return setProblemSolved(value.questionId as number, value.solved);
        },
      }, { signal: lifecycle.signal });

      await context.registerTool({
        name: 'get_study_progress',
        title: 'Read study progress',
        description: 'Return the solved problem count and IDs for the current interview study plan.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true, untrustedContentHint: false },
        execute() {
          return { solvedCount: solvedRef.current.length, totalCount: totalProblemCount, solvedIds: solvedRef.current };
        },
      }, { signal: lifecycle.signal });
    };

    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, [setProblemSolved]);

  const filteredProblems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activeChapter.problems.filter((problem) => {
      const matchesFilter = filter === 'all' || (filter === 'solved' ? solvedIds.includes(problem.id) : !solvedIds.includes(problem.id));
      const matchesQuery = !normalized || problem.title.toLowerCase().includes(normalized) || String(problem.id).includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [activeChapter, filter, query, solvedIds]);

  const solvedCount = solvedIds.length;
  const progressPercent = Math.round((solvedCount / totalProblemCount) * 100);
  const chapterSolved = activeChapter.problems.filter((problem) => solvedIds.includes(problem.id)).length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_22px_oklch(0.62_0.19_253/22%)]"><Code2 size={20} /></span>
            <div className="min-w-0"><p className="truncate font-heading text-lg font-bold leading-none">Interview Atlas</p><p className="mt-1 hidden text-xs text-muted-foreground sm:block">Your algorithm field guide</p></div>
          </div>

          <label className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-sm shadow-inner md:flex">
            <Search size={16} className="text-muted-foreground" />
            <span className="sr-only">Search current chapter</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this chapter" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
            {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}
          </label>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-bold">
            {isLoading ? <LoaderCircle size={16} className="animate-spin text-primary" /> : <CheckCircle2 size={16} className="text-primary" />}
            <span>{solvedCount}<span className="hidden text-muted-foreground sm:inline"> / {totalProblemCount} solved</span></span>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[290px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-sidebar px-4 py-5 lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Study chapters</p>
            <span className="font-mono text-xs text-muted-foreground">09</span>
          </div>

          <nav aria-label="Study chapters" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0">
            {chapters.map((chapter, index) => {
              const Icon = chapterIcons[index];
              const count = chapter.problems.filter((problem) => solvedIds.includes(problem.id)).length;
              const active = chapter.id === activeId;
              return (
                <button
                  key={chapter.id}
                  type="button"
                  onClick={() => { setActiveId(chapter.id); setQuery(''); }}
                  className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-left transition lg:w-full ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
                >
                  <Icon size={17} />
                  <span className="flex-1 text-sm font-semibold">{chapter.shortTitle}</span>
                  <span className={`font-mono text-xs ${active ? 'text-white/65' : 'text-muted-foreground'}`}>{count}/{chapter.problems.length}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-6 hidden rounded-2xl border border-sidebar-border bg-card p-4 lg:block">
            <div className="flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Overall progress</p><p className="mt-2 text-3xl font-bold">{progressPercent}%</p></div><p className="font-mono text-xs text-muted-foreground">{solvedCount}/{totalProblemCount}</p></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} /></div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">Complete each chapter, then revisit the hard problems without notes.</p>
          </div>
        </aside>

        <section className="px-4 py-7 sm:px-7 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-5xl">
            {syncError && (
              <output className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertCircle size={17} className="shrink-0" />
                <span className="flex-1">Progress did not sync. Your last saved answers are safe.</span>
                <button type="button" onClick={() => { setIsLoading(true); void loadProgress(); }} className="font-bold underline underline-offset-2">Retry</button>
              </output>
            )}

            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Pattern {activeChapter.pattern}</p><h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">{activeChapter.title}</h1></div>
              <div className="flex items-center gap-2"><span className="rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm">{activeChapter.complexity}</span><span className="rounded-lg bg-accent px-3 py-2 font-mono text-sm font-bold text-accent-foreground">{chapterSolved}/{activeChapter.problems.length}</span></div>
            </div>

            <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_50px_oklch(0.2_0.03_260/6%)]">
              <div className="grid gap-7 border-b border-border p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
                <div>
                  <p className="text-lg leading-relaxed text-muted-foreground">{activeChapter.intro}</p>
                  <div className="mt-6 border-l-2 border-primary pl-4"><p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">Core idea</p><p className="leading-relaxed">{activeChapter.insight}</p></div>
                </div>
                <div className="rounded-2xl bg-foreground p-5 text-background sm:p-6">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sky-300">Recognition cues</p>
                  <ul className="space-y-3 text-sm leading-relaxed">{activeChapter.cues.map((cue) => <li key={cue} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{cue}</li>)}</ul>
                </div>
              </div>
              <div className="bg-[#10141c]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 sm:px-7"><p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">{activeChapter.templateTitle}</p><div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-rose-400" /><span className="size-2.5 rounded-full bg-amber-300" /><span className="size-2.5 rounded-full bg-emerald-400" /></div></div>
                <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-slate-300 sm:p-7"><code>{activeChapter.code}</code></pre>
              </div>
            </article>

            <div className="mt-9 flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Practice set</p><h2 className="mt-1 text-2xl font-bold">Problems to master</h2></div>
              <div role="tablist" aria-label="Problem status" className="flex rounded-xl border border-border bg-card p-1">
                {(['all', 'unsolved', 'solved'] as Filter[]).map((value) => <button key={value} type="button" role="tab" aria-selected={filter === value} onClick={() => setFilter(value)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold capitalize transition ${filter === value ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}>{value}</button>)}
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm shadow-sm md:hidden">
              <Search size={16} className="text-muted-foreground" /><span className="sr-only">Search current chapter</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this chapter" className="min-w-0 flex-1 bg-transparent outline-none" />{query && <button type="button" onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}
            </label>

            <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {filteredProblems.length ? filteredProblems.map((problem) => {
                const isSolved = solvedIds.includes(problem.id);
                const isSaving = savingIds.includes(problem.id);
                return (
                  <div key={problem.id} className="group flex items-start gap-3 border-b border-border px-4 py-4 last:border-b-0 hover:bg-muted/55 sm:items-center sm:gap-4 sm:px-5">
                    <Checkbox checked={isSolved} disabled={isSaving} onCheckedChange={(checked) => void setProblemSolved(problem.id, checked)} aria-label={`Mark ${problem.title} as ${isSolved ? 'unsolved' : 'solved'}`} className="mt-0.5 sm:mt-0" />
                    <span className="w-9 shrink-0 pt-0.5 font-mono text-sm text-muted-foreground sm:pt-0">{problem.id}</span>
                    <div className="min-w-0 flex-1"><a href={`https://leetcode.com/problems/${problem.slug}/`} target="_blank" rel="noreferrer" className={`inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline ${isSolved ? 'text-muted-foreground line-through' : ''}`}>{problem.title}<ExternalLink size={13} className="opacity-0 transition-opacity group-hover:opacity-100" /></a><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{problem.note}</p></div>
                    {isSaving ? <LoaderCircle size={16} className="mt-1 shrink-0 animate-spin text-primary sm:mt-0" /> : <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${difficultyClass(problem.difficulty)}`}>{problem.difficulty}</span>}
                  </div>
                );
              }) : (
                <div className="px-5 py-12 text-center"><Search size={24} className="mx-auto text-muted-foreground" /><p className="mt-3 font-semibold">No problems match this view</p><p className="mt-1 text-sm text-muted-foreground">Try another status or clear your search.</p></div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
