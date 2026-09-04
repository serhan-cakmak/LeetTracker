const leetCodeRecentQuery = `
  query recentAcSubmissions($username: String!, $limit: Int!) {
    matchedUser(username: $username) {
      username
    }
    recentAcSubmissionList(username: $username, limit: $limit) {
      titleSlug
      statusDisplay
    }
  }
`;

type LeetCodeResponse = {
  data?: {
    matchedUser?: { username?: string } | null;
    recentAcSubmissionList?: Array<{
      statusDisplay?: string;
      titleSlug?: string;
    }> | null;
  };
  errors?: Array<{ message?: string }>;
};

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get('username')?.trim();
  if (!username || !/^[a-zA-Z0-9_-]{1,64}$/.test(username)) {
    return Response.json(
      { error: 'Enter a valid LeetCode username.' },
      { status: 400 },
    );
  }

  try {
    const response = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com/',
      },
      body: JSON.stringify({
        query: leetCodeRecentQuery,
        variables: { username, limit: 20 },
      }),
    });
    if (!response.ok) throw new Error(`LeetCode returned ${response.status}`);

    const result = (await response.json()) as LeetCodeResponse;
    if (result.errors?.length) throw new Error('LeetCode query failed');
    if (!result.data?.matchedUser) {
      return Response.json(
        { error: 'That LeetCode username was not found.' },
        { status: 404 },
      );
    }

    const titleSlugs = [
      ...new Set(
        (result.data.recentAcSubmissionList ?? [])
          .filter((submission) => submission.statusDisplay === 'Accepted')
          .map((submission) => submission.titleSlug)
          .filter((slug): slug is string => Boolean(slug)),
      ),
    ];

    return Response.json(
      { titleSlugs },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  } catch (error) {
    console.error('Unable to read recent LeetCode submissions', error);
    return Response.json(
      {
        error:
          'LeetCode could not be reached. Use the full-history JSON import instead.',
      },
      { status: 502 },
    );
  }
}
