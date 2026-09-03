import { env } from 'cloudflare:workers';

export async function GET() {
  try {
    const result = await env.DB.prepare(
      'SELECT question_id AS questionId FROM problem_progress WHERE solved = 1 ORDER BY question_id',
    ).all<{ questionId: number }>();

    return Response.json({ solvedIds: result.results.map((row) => row.questionId) });
  } catch (error) {
    console.error('Unable to load progress', error);
    return Response.json({ error: 'Progress is temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { questionId?: unknown; solved?: unknown } | null;
  const questionId = body?.questionId;
  const solved = body?.solved;

  if (!Number.isInteger(questionId) || typeof solved !== 'boolean') {
    return Response.json({ error: 'A valid questionId and solved value are required.' }, { status: 400 });
  }

  try {
    await env.DB.prepare(
      `INSERT INTO problem_progress (question_id, solved, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(question_id) DO UPDATE SET
         solved = excluded.solved,
         updated_at = CURRENT_TIMESTAMP`,
    ).bind(questionId, solved ? 1 : 0).run();

    return Response.json({ questionId, solved });
  } catch (error) {
    console.error('Unable to save progress', error);
    return Response.json({ error: 'Progress could not be saved.' }, { status: 503 });
  }
}
