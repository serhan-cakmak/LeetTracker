'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chapters, totalProblemCount } from '@/features/study-plan/data';

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

const studyProblemIds = new Set(
  chapters.flatMap((chapter) => chapter.problems.map((problem) => problem.id)),
);

export function useProgress() {
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const solvedRef = useRef<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingIds, setSavingIds] = useState<number[]>([]);
  const [syncError, setSyncError] = useState(false);

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

  const retryProgress = useCallback(() => {
    setIsLoading(true);
    return loadProgress();
  }, [loadProgress]);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  const setProblemSolved = useCallback(
    async (questionId: number, solved: boolean) => {
      const previous = solvedRef.current;
      const next = solved
        ? [...new Set([...previous, questionId])]
        : previous.filter((id) => id !== questionId);

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
    },
    [],
  );

  const syncAcceptedProblems = useCallback(async (acceptedIds: number[]) => {
    const matchedIds = [
      ...new Set(
        acceptedIds.filter(
          (questionId) =>
            Number.isInteger(questionId) && studyProblemIds.has(questionId),
        ),
      ),
    ];
    const previous = solvedRef.current;
    const previousSet = new Set(previous);
    const addedCount = matchedIds.filter(
      (questionId) => !previousSet.has(questionId),
    ).length;
    const next = [...new Set([...previous, ...matchedIds])].sort((a, b) => a - b);

    solvedRef.current = next;
    setSolvedIds(next);
    setSavingIds((current) => [...new Set([...current, ...matchedIds])]);

    try {
      const response = await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acceptedIds: matchedIds }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? 'LeetCode progress could not be saved.');
      }

      setSyncError(false);
      return { addedCount, matchedCount: matchedIds.length };
    } catch (error) {
      solvedRef.current = previous;
      setSolvedIds(previous);
      setSyncError(true);
      throw error instanceof Error
        ? error
        : new Error('LeetCode progress could not be saved.');
    } finally {
      const matchedSet = new Set(matchedIds);
      setSavingIds((current) =>
        current.filter((questionId) => !matchedSet.has(questionId)),
      );
    }
  }, []);

  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext })
      .modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();
    const registerTools = async () => {
      await context.registerTool(
        {
          name: 'set_problem_solved',
          title: 'Update problem progress',
          description:
            'Mark one interview-practice problem as solved or unsolved and save the new progress.',
          inputSchema: {
            type: 'object',
            properties: {
              questionId: {
                type: 'integer',
                description: 'The LeetCode problem number.',
              },
              solved: {
                type: 'boolean',
                description: 'Whether the problem is solved.',
              },
            },
            required: ['questionId', 'solved'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input) {
            const value = input as { questionId?: unknown; solved?: unknown };
            if (
              !Number.isInteger(value.questionId) ||
              typeof value.solved !== 'boolean' ||
              !studyProblemIds.has(value.questionId as number)
            ) {
              throw new Error(
                'Use a valid problem number from the study plan and a boolean solved value.',
              );
            }

            return setProblemSolved(value.questionId as number, value.solved);
          },
        },
        { signal: lifecycle.signal },
      );

      await context.registerTool(
        {
          name: 'get_study_progress',
          title: 'Read study progress',
          description:
            'Return the solved problem count and IDs for the current interview study plan.',
          inputSchema: {
            type: 'object',
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute() {
            return {
              solvedCount: solvedRef.current.length,
              totalCount: totalProblemCount,
              solvedIds: solvedRef.current,
            };
          },
        },
        { signal: lifecycle.signal },
      );
    };

    void registerTools().catch(() => undefined);
    return () => lifecycle.abort();
  }, [setProblemSolved]);

  return {
    isLoading,
    loadProgress: retryProgress,
    savingIds,
    setProblemSolved,
    solvedIds,
    syncAcceptedProblems,
    syncError,
  };
}
