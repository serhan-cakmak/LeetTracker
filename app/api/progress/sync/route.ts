import { env } from 'cloudflare:workers';
import { chapters } from '@/features/study-plan/data';

const studyProblemIds = new Set(
  chapters.flatMap((chapter) => chapter.problems.map((problem) => problem.id)),
);

const upsertSolved = `INSERT INTO problem_progress (question_id, solved, updated_at)
  VALUES (?, 1, CURRENT_TIMESTAMP)
  ON CONFLICT(question_id) DO UPDATE SET
    solved = 1,
    updated_at = CURRENT_TIMESTAMP`;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    acceptedIds?: unknown;
  } | null;

  if (!Array.isArray(body?.acceptedIds)) {
    return Response.json(
      { error: 'A list of accepted problem IDs is required.' },
      { status: 400 },
    );
  }

  const matchedIds = [
    ...new Set(
      body.acceptedIds.filter(
        (questionId): questionId is number =>
          Number.isInteger(questionId) &&
          studyProblemIds.has(questionId as number),
      ),
    ),
  ];

  if (matchedIds.length > studyProblemIds.size) {
    return Response.json(
      { error: 'The progress import contains too many problems.' },
      { status: 400 },
    );
  }

  try {
    for (let start = 0; start < matchedIds.length; start += 50) {
      const chunk = matchedIds.slice(start, start + 50);
      await env.DB.batch(
        chunk.map((questionId) =>
          env.DB.prepare(upsertSolved).bind(questionId),
        ),
      );
    }

    return Response.json({ matchedIds });
  } catch (error) {
    console.error('Unable to sync LeetCode progress', error);
    return Response.json(
      { error: 'LeetCode progress could not be saved.' },
      { status: 503 },
    );
  }
}
