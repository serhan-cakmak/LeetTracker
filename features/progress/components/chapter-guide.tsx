import type { Chapter } from '@/features/study-plan/data';

type ChapterGuideProps = {
  chapter: Chapter;
  solvedCount: number;
};

export function ChapterGuide({ chapter, solvedCount }: ChapterGuideProps) {
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
        <div className="bg-[#10141c]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 sm:px-7">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
              {chapter.templateTitle}
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-300" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
            </div>
          </div>
          <pre className="overflow-x-auto p-5 font-mono text-sm leading-7 text-slate-300 sm:p-7">
            <code>{chapter.code}</code>
          </pre>
        </div>
      </article>
    </>
  );
}
