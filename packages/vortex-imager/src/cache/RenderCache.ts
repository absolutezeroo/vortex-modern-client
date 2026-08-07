/**
 * Caches rendered PNGs, and collapses concurrent renders of the same image into one.
 *
 * The de-duplication matters more than the cache does. A room full of one guild, or a forum
 * page listing the same avatar twenty times, arrives as twenty simultaneous requests for
 * identical bytes; without this they would each composite from scratch on the one thread the
 * renderer has.
 */
import {LRUCache} from 'lru-cache';

export class RenderCache
{
    private _entries: LRUCache<string, Buffer>;
    private _inFlight: Map<string, Promise<Buffer>> = new Map();

    constructor(maxEntries: number, ttlMs: number)
    {
        this._entries = new LRUCache<string, Buffer>({
            max: Math.max(1, maxEntries),
            ttl: ttlMs > 0 ? ttlMs : undefined
        });
    }

    get size(): number
    {
        return this._entries.size;
    }

    async resolve(key: string, render: () => Promise<Buffer>): Promise<{ buffer: Buffer; hit: boolean }>
    {
        const cached = this._entries.get(key);

        if(cached !== undefined) return {buffer: cached, hit: true};

        const pending = this._inFlight.get(key);

        if(pending !== undefined) return {buffer: await pending, hit: true};

        const task = render();

        this._inFlight.set(key, task);

        try
        {
            const buffer = await task;

            this._entries.set(key, buffer);

            return {buffer, hit: false};
        }
        finally
        {
            this._inFlight.delete(key);
        }
    }

    clear(): void
    {
        this._entries.clear();
    }
}
