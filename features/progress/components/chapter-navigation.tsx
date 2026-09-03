import {
  Binary,
  BookOpenCheck,
  Braces,
  GitBranch,
  Layers3,
  ListTree,
  Network,
  Rows3,
  Sparkles,
} from 'lucide-react';
import { chapters, totalProblemCount } from '@/features/study-plan/data';

const chapterIcons = [
  Braces,
  Rows3,
  Layers3,
  Binary,
  ListTree,
  GitBranch,
  Sparkles,
  Network,
  BookOpenCheck,
];

type ChapterNavigationProps = {
  activeId: string;
  progressPercent: number;
  solvedIds: number[];
  onChapterSelect: (chapterId: string) => void;
};

export function ChapterNavigation({
  activeId,
  onChapterSelect,
  progressPercent,
  solvedIds,
}: ChapterNavigationProps) {
  return (
    <aside className="min-w-0 border-b border-border bg-sidebar px-4 py-5 lg:sticky lg:top-[65px] lg:h-[calc(100vh-65px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Study chapters
        </p>
        <span className="font-mono text-xs text-muted-foreground">
          {String(chapters.length).padStart(2, '0')}
        </span>
      </div>

      <nav
        aria-label="Study chapters"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:block lg:space-y-1 lg:overflow-visible lg:pb-0"
      >
        {chapters.map((chapter, index) => {
          const Icon = chapterIcons[index % chapterIcons.length];
          const solvedCount = chapter.problems.filter((problem) =>
            solvedIds.includes(problem.id),
          ).length;
          const isActive = chapter.id === activeId;

          return (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onChapterSelect(chapter.id)}
              className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-left transition lg:w-full ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent'}`}
            >
              <Icon size={17} />
              <span className="flex-1 text-sm font-semibold">
                {chapter.shortTitle}
              </span>
              <span
                className={`font-mono text-xs ${isActive ? 'text-white/65' : 'text-muted-foreground'}`}
              >
                {solvedCount}/{chapter.problems.length}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-6 hidden rounded-2xl border border-sidebar-border bg-card p-4 lg:block">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Overall progress
            </p>
            <p className="mt-2 text-3xl font-bold">{progressPercent}%</p>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {solvedIds.length}/{totalProblemCount}
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Complete each chapter, then revisit the hard problems without notes.
        </p>
      </div>
    </aside>
  );
}
