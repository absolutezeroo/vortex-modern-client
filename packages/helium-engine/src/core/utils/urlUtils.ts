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

	for (const rewrite of LOCAL_ASSET_ORIGIN_REWRITES)
	{
		if (parsed.origin === rewrite.origin)
		{
			return rewrite.prefix + parsed.pathname + parsed.search + parsed.hash;
		}
	}

	return url;
}