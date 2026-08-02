/**
 * ChangelogService
 *
 * Original addition — not part of the AS3 client, no AS3 source to trace.
 *
 * Fetches recent commits from the project's GitHub repos so the client can show
 * an in-game "What's New" window. Uses the public, unauthenticated GitHub REST
 * API (https://docs.github.com/en/rest/commits/commits#list-commits).
 *
 * This header used to say vortex-modern-client was left out of SOURCES for being
 * a private repo. It is in SOURCES, and both entries answer 200 unauthenticated
 * (checked 2026-08-02) — the repo is public now. Should either one go private
 * again, its requests 404 and `fetchAll()` silently drops that source, and the
 * fix is NOT to embed a GitHub token: anything shipped to the browser can be
 * pulled out of devtools. Stand up a server-side proxy that holds the token and
 * re-serves the list, then point fetchRepo() at it.
 *
 * Rate limit: 60 requests an hour per IP, unauthenticated, and one call here
 * spends one per source. That is why ChangelogWindow fetches on open and caches
 * the result rather than fetching on every page load.
 */

export interface IChangelogCommit
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

interface IChangelogSource
{
    label: string;
    owner: string;
    repo: string;
}

const SOURCES: IChangelogSource[] = [
    { label: 'Emulator', owner: 'absolutezeroo', repo: 'vortex-cloud' },
    { label: 'Client', owner: 'absolutezeroo', repo: 'vortex-modern-client' },
];

interface IGitHubCommitResponse
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
    public static async fetchAll(perRepo: number = 15): Promise<IChangelogCommit[]>
    {
        const results = await Promise.allSettled(
            SOURCES.map((source) => ChangelogService.fetchRepo(source, perRepo))
        );

        const commits: IChangelogCommit[] = [];

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

    private static async fetchRepo(source: IChangelogSource, perPage: number): Promise<IChangelogCommit[]>
    {
        const url = `https://api.github.com/repos/${source.owner}/${source.repo}/commits?per_page=${perPage}`;
        const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });

        if(!response.ok)
        {
            throw new Error(`GitHub API returned ${response.status} for ${source.owner}/${source.repo}`);
        }

        const data = await response.json() as IGitHubCommitResponse[];

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
