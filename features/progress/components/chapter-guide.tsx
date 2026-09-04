import { AlertTriangle, BookOpenCheck, ChevronDown } from 'lucide-react';
import { chapterReminders } from '@/features/study-plan/reminders';
import type { Chapter } from '@/features/study-plan/data';

type ChapterGuideProps = {
  chapter: Chapter;
  solvedCount: number;
};

export function ChapterGuide({ chapter, solvedCount }: ChapterGuideProps) {
  const reminder =
    chapterReminders[chapter.id as keyof typeof chapterReminders];

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Pattern {chapter.pattern}
          </p>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">
            {chapter.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-border bg-card px-3 py-2 font-mono text-sm">
            {chapter.complexity}
          </span>
          <span className="rounded-lg bg-accent px-3 py-2 font-mono text-sm font-bold text-accent-foreground">
            {solvedCount}/{chapter.problems.length}
          </span>
        </div>
      </div>

      <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_16px_50px_oklch(0.2_0.03_260/6%)]">
        <div className="grid gap-7 border-b border-border p-5 sm:p-7 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {chapter.intro}
            </p>
            <div className="mt-6 border-l-2 border-primary pl-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
                Core idea
              </p>
              <p className="leading-relaxed">{chapter.insight}</p>
            </div>
          </div>
          <div className="rounded-2xl bg-foreground p-5 text-background sm:p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sky-300">
              Recognition cues
            </p>
            <ul className="space-y-3 text-sm leading-relaxed">
              {chapter.cues.map((cue) => (
                <li key={cue} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  {cue}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-slate-50 p-5 sm:p-7 lg:p-8">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <BookOpenCheck size={19} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Before the problems
              </p>
              <h2 className="mt-1 text-2xl font-bold">Topic refresher</h2>
              <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
                {reminder.blurb} Review the implementations below, then start
                the practice set.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-2 rounded-2xl border border-sky-200 bg-sky-50 p-4 sm:grid-cols-3 sm:gap-4">
            {reminder.checklist.map((item, index) => (
              <div key={item} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-mono font-bold text-primary">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {reminder.patterns.map((pattern, index) => (
              <details
                key={pattern.name}
                open={index === 0}
                className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-start gap-3 p-4 marker:hidden sm:items-center sm:p-5 [&::-webkit-details-marker]:hidden">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-foreground font-mono text-xs font-bold text-background">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{pattern.name}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {pattern.trigger}
                    </span>
                  </span>
                  <span className="hidden rounded-lg bg-muted px-2.5 py-1.5 font-mono text-xs text-muted-foreground sm:block">
                    {pattern.complexity}
                  </span>
                  <ChevronDown
                    size={18}
                    className="mt-1 shrink-0 text-muted-foreground transition-transform group-open:rotate-180 sm:mt-0"
                  />
                </summary>
                <div className="border-t border-border">
                  <div className="border-b border-border bg-amber-50 px-4 py-3 text-sm leading-relaxed sm:px-5">
                    <span className="font-bold text-amber-900">Invariant · </span>
                    <span className="text-amber-950/80">{pattern.invariant}</span>
                  </div>
                  <div className="bg-[#10141c]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 sm:px-5">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                        Python template
                      </span>
                      <span className="font-mono text-xs text-slate-500 sm:hidden">
                        {pattern.complexity}
                      </span>
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-sm leading-7 text-slate-300 sm:p-5">
                      <code>{pattern.code}</code>
                    </pre>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:p-5">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle size={17} />
              <p className="text-xs font-bold uppercase tracking-[0.16em]">
                Easy mistakes to avoid
              </p>
            </div>
            <ul className="mt-3 grid gap-2 text-sm leading-relaxed text-rose-950/85 sm:grid-cols-2 sm:gap-5">
              {reminder.pitfalls.map((pitfall) => (
                <li key={pitfall} className="flex gap-2">
                  <span aria-hidden="true">→</span>
                  {pitfall}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    </>
  );
}
