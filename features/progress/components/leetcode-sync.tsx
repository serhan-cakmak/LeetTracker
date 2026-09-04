'use client';

import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { chapters } from '@/features/study-plan/data';

type SyncResult = {
  addedCount: number;
  matchedCount: number;
};

type LeetCodeSyncProps = {
  onSync: (acceptedIds: number[]) => Promise<SyncResult>;
};

type SyncState =
  | { status: 'idle' }
  | { status: 'syncing'; mode: 'recent' | 'export' }
  | {
      status: 'success';
      inspectedCount: number;
      mode: 'recent' | 'export';
      result: SyncResult;
    }
  | { status: 'error'; message: string };

type LeetCodeExport = {
  stat_status_pairs?: Array<{
    stat?: { frontend_question_id?: number | string };
    status?: string | null;
  }>;
};

const problemIdBySlug = new Map(
  chapters.flatMap((chapter) =>
    chapter.problems.map((problem) => [problem.slug, problem.id] as const),
  ),
);

function acceptedIdsFromExport(value: unknown) {
  const data = value as LeetCodeExport;
  if (!Array.isArray(data?.stat_status_pairs)) {
    throw new Error(
      'This does not look like a LeetCode progress export. Download the JSON from the link above and try again.',
    );
  }

  return [
    ...new Set(
      data.stat_status_pairs
        .filter((entry) => entry?.status === 'ac')
        .map((entry) => Number(entry.stat?.frontend_question_id))
        .filter(Number.isInteger),
    ),
  ];
}

export function LeetCodeSync({ onSync }: LeetCodeSyncProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<SyncState>({ status: 'idle' });
  const [username, setUsername] = useState('');

  const close = () => dialogRef.current?.close();

  const open = () => {
    if (!username) {
      setUsername(localStorage.getItem('interview-atlas-leetcode-user') ?? '');
    }
    dialogRef.current?.showModal();
  };

  const importFile = async (file: File) => {
    setState({ status: 'syncing', mode: 'export' });
    try {
      const data = JSON.parse(await file.text()) as unknown;
      const acceptedIds = acceptedIdsFromExport(data);
      if (!acceptedIds.length) {
        throw new Error('No accepted problems were found in this export.');
      }
      const result = await onSync(acceptedIds);
      setState({
        status: 'success',
        inspectedCount: acceptedIds.length,
        mode: 'export',
        result,
      });
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'The LeetCode export could not be imported.',
      });
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const syncRecent = async () => {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setState({ status: 'error', message: 'Enter your LeetCode username.' });
      return;
    }

    setState({ status: 'syncing', mode: 'recent' });
    try {
      const response = await fetch(
        `/api/leetcode/recent?username=${encodeURIComponent(cleanUsername)}`,
      );
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        titleSlugs?: string[];
      } | null;
      if (!response.ok || !Array.isArray(data?.titleSlugs)) {
        throw new Error(data?.error ?? 'Recent LeetCode progress is unavailable.');
      }

      const acceptedIds = data.titleSlugs
        .map((slug) => problemIdBySlug.get(slug))
        .filter((problemId): problemId is number => problemId !== undefined);
      const result = await onSync(acceptedIds);
      localStorage.setItem('interview-atlas-leetcode-user', cleanUsername);
      setState({
        status: 'success',
        inspectedCount: data.titleSlugs.length,
        mode: 'recent',
        result,
      });
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Recent LeetCode progress is unavailable.',
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2 text-sm font-bold transition hover:border-primary/40 hover:bg-sky-50 sm:px-3"
        aria-label="Sync solved problems from LeetCode"
      >
        <RefreshCw size={16} className="text-primary" />
        <span className="hidden sm:inline">Sync LeetCode</span>
      </button>

      <dialog
        ref={dialogRef}
        onCancel={close}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-3xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-slate-950/45"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
              Progress import
            </p>
            <h2 className="mt-1 text-2xl font-bold">Sync from LeetCode</h2>
          </div>
          <button
            type="button"
            onClick={close}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close LeetCode sync"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <section className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
              Quick refresh
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Check your latest 20 accepted submissions using your public
              LeetCode username.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <label className="min-w-0 flex-1">
                <span className="sr-only">LeetCode username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') void syncRecent();
                  }}
                  placeholder="LeetCode username"
                  autoComplete="username"
                  className="h-10 w-full rounded-xl border border-sky-200 bg-card px-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <button
                type="button"
                onClick={() => void syncRecent()}
                disabled={state.status === 'syncing'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-foreground px-4 text-sm font-bold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-65"
              >
                {state.status === 'syncing' && state.mode === 'recent' ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
                Sync recent
              </button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              For older solves, use the full-history import below.
            </p>
          </section>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Full history
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                1
              </span>
              <div>
                <p className="font-bold">Open your LeetCode progress</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Make sure you are logged into LeetCode, then open its JSON
                  progress page.
                </p>
                <a
                  href="https://leetcode.com/api/problems/all/"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-primary underline underline-offset-4"
                >
                  Open LeetCode export <ExternalLink size={13} />
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                2
              </span>
              <div>
                <p className="font-bold">Save the page as JSON</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Press <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">⌘S</kbd>{' '}
                  on Mac or <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">Ctrl+S</kbd>{' '}
                  on Windows and keep the <strong>.json</strong> file.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                3
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold">Import it here</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Accepted questions in this study plan will be marked solved.
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".json,application/json"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void importFile(file);
                  }}
                />
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={state.status === 'syncing'}
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-95 disabled:cursor-wait disabled:opacity-65"
                >
                  {state.status === 'syncing' && state.mode === 'export' ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {state.status === 'syncing' && state.mode === 'export'
                    ? 'Updating progress…'
                    : 'Choose LeetCode JSON'}
                </button>
              </div>
            </li>
          </ol>

          {state.status === 'success' && (
            <output className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-700" />
              <span>
                {state.mode === 'recent' && (
                  <>Checked {state.inspectedCount} recent accepted submissions. </>
                )}
                <strong>{state.result.matchedCount} accepted problems</strong>{' '}
                matched this study plan; {state.result.addedCount} were newly
                marked solved.
              </span>
            </output>
          )}

          {state.status === 'error' && (
            <output className="mt-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-relaxed text-rose-950">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-rose-700" />
              <span>{state.message}</span>
            </output>
          )}

          <div className="mt-5 flex gap-2 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
            <ShieldCheck size={16} className="shrink-0 text-emerald-700" />
            <p>
              Your LeetCode password and session cookie are never requested.
              Sync only adds accepted problems; it does not clear manual marks.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
