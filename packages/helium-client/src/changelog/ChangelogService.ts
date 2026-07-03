/**
 * ChangelogService
 *
 * Original addition — not part of the AS3 client, no AS3 source to trace.
 *
 * Fetches recent commits from the project's GitHub repos so the client can show
 * an in-game "What's New" window. Uses the public, unauthenticated GitHub REST
 * API (https://docs.github.com/en/rest/commits/commits#list-commits).
 *
 * vortex-modern-client itself is a *private* repo, so it's deliberately left out
 * of SOURCES below — an unauthenticated request to a private repo's API just
 * 404s, and the only way to make it work is a GitHub token, which must never be
 * embedded in code that ships to every player's browser (anyone can pull it out
 * of devtools and get read access to the repo). To add it back:
 *   - make the repo public and add it to SOURCES as-is, or
 *   - stand up a small server-side proxy endpoint that holds the token securely
 *     and re-serves the commit list, and point fetchRepo() at that instead.
 */

export interface ChangelogCommit
{
	/** Display label for the source repo, e.g. "Emulator". */
	repoLabel: string;
	/** Short 7-char SHA. */
	shortSha: string;
	/** First line of the commit message. */
	summary: string;
	authorName: string;
	/** ISO 8601 commit date. */
	date: string;
	/** Link to the commit on GitHub. */
	url: string;
}

interface ChangelogSource
{
	label: string;
	owner: string;
	repo: string;
}

const SOURCES: ChangelogSource[] = [
	{ label: 'Emulator', owner: 'absolutezeroo', repo: 'vortex-cloud' },
	{ label: 'Client', owner: 'absolutezeroo', repo: 'vortex-modern-client' },
];

interface GitHubCommitResponse
{
	sha: string;
	html_url: string;
	commit: {
		message: string;
		author: { name: string; date: string } | null;
	};
	author: { login: string } | null;
}

export class ChangelogService
{
	/**
	 * Fetches recent commits from every configured source, merged and sorted
	 * newest-first. Sources that fail (rate-limited, offline, etc.) are silently
	 * skipped rather than failing the whole list.
	 */
	public static async fetchAll(perRepo: number = 15): Promise<ChangelogCommit[]>
	{
		const results = await Promise.allSettled(
			SOURCES.map((source) => ChangelogService.fetchRepo(source, perRepo))
		);

		const commits: ChangelogCommit[] = [];

		for(const result of results)
		{
			if(result.status === 'fulfilled')
			{
				commits.push(...result.value);
			}
		}

		commits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

		return commits;
	}

	private static async fetchRepo(source: ChangelogSource, perPage: number): Promise<ChangelogCommit[]>
	{
		const url = `https://api.github.com/repos/${source.owner}/${source.repo}/commits?per_page=${perPage}`;
		const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });

		if(!response.ok)
		{
			throw new Error(`GitHub API returned ${response.status} for ${source.owner}/${source.repo}`);
		}

		const data = await response.json() as GitHubCommitResponse[];

		return data.map((item) => ({
			repoLabel: source.label,
			shortSha: item.sha.slice(0, 7),
			summary: (item.commit.message || '').split('\n')[0],
			authorName: item.commit.author?.name ?? item.author?.login ?? 'Unknown',
			date: item.commit.author?.date ?? new Date(0).toISOString(),
			url: item.html_url,
		}));
	}
}
