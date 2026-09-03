'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { ChapterGuide } from '@/features/progress/components/chapter-guide';
import { ChapterNavigation } from '@/features/progress/components/chapter-navigation';
import { ProblemList } from '@/features/progress/components/problem-list';
import { TrackerHeader } from '@/features/progress/components/tracker-header';
import { useProgress } from '@/features/progress/hooks/use-progress';
import type { ProblemFilter } from '@/features/progress/types';
import { chapters, totalProblemCount } from '@/features/study-plan/data';

export function ProgressTracker() {
  const [activeId, setActiveId] = useState(chapters[0].id);
  const [filter, setFilter] = useState<ProblemFilter>('all');
  const [query, setQuery] = useState('');
  const {
    isLoading,
    loadProgress,
    savingIds,
    setProblemSolved,
    solvedIds,
    syncError,
  } = useProgress();

  const activeChapter =
    chapters.find((chapter) => chapter.id === activeId) ?? chapters[0];
  const solvedCount = solvedIds.length;
  const chapterSolvedCount = activeChapter.problems.filter((problem) =>
    solvedIds.includes(problem.id),
  ).length;
  const progressPercent = Math.round((solvedCount / totalProblemCount) * 100);

  const selectChapter = (chapterId: string) => {
    setActiveId(chapterId);
    setQuery('');
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <TrackerHeader
        isLoading={isLoading}
        query={query}
        solvedCount={solvedCount}
        totalCount={totalProblemCount}
        onQueryChange={setQuery}
      />

      <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)] lg:grid-cols-[290px_minmax(0,1fr)]">
        <ChapterNavigation
          activeId={activeId}
          progressPercent={progressPercent}
          solvedIds={solvedIds}
          onChapterSelect={selectChapter}
        />

        <section className="min-w-0 px-4 py-7 sm:px-7 lg:px-12 lg:py-10">
          <div className="mx-auto max-w-5xl">
            {syncError && (
              <output className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <AlertCircle size={17} className="shrink-0" />
                <span className="flex-1">
                  Progress did not sync. Your last saved answers are safe.
                </span>
                <button
                  type="button"
                  onClick={() => void loadProgress()}
                  className="font-bold underline underline-offset-2"
                >
                  Retry
                </button>
              </output>
            )}

            <ChapterGuide
              chapter={activeChapter}
              solvedCount={chapterSolvedCount}
            />
            <ProblemList
              chapter={activeChapter}
              filter={filter}
              query={query}
              savingIds={savingIds}
              solvedIds={solvedIds}
              onFilterChange={setFilter}
              onQueryChange={setQuery}
              onSolvedChange={setProblemSolved}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
