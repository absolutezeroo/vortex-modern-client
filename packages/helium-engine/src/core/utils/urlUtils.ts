const LOCAL_DEV_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

const LOCAL_ASSET_ORIGIN_REWRITES: Array<{ origin: string; prefix: string }> = [
	{origin: 'http://vortex-assets.local', prefix: ''},
	{origin: 'https://vortex-assets.local', prefix: ''},
];

export function normalizeLocalAssetUrl(url: string): string
{
	if (!url || typeof window === 'undefined')
	{
		return url;
	}

	if (!LOCAL_DEV_HOSTS.has(window.location.hostname))
	{
		return url;
	}

	let parsed: URL;

	try
	{
		parsed = new URL(url, window.location.href);
	}
	catch
	{
		return url;
	}

	// A bare origin with no real path (pathname === "/") is a *prefix* value like
	// config's "url.prefix" — meant to be concatenated with a path elsewhere, not
	// fetched as-is. Rewriting it here would collapse it down to just "/" (prefix
	// "" + pathname "/"), and "/" + "/api/..." elsewhere becomes "//api/..." — a
	// protocol-relative URL the browser resolves against the *current* origin,
	// treating "api" as a hostname (net::ERR_NAME_NOT_RESOLVED). Only rewrite
	// values that already look like a real asset URL.
	if (parsed.pathname === '/')
	{
		return url;
	}

	for (const rewrite of LOCAL_ASSET_ORIGIN_REWRITES)
	{
		if (parsed.origin === rewrite.origin)
		{
			return rewrite.prefix + parsed.pathname + parsed.search + parsed.hash;
		}
	}

	return url;
}