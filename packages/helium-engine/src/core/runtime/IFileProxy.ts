/**
 * File proxy interface for persistent storage.
 *
 * AS3 equivalent: com.sulake.core.utils.class_67 (IFileProxy).
 *
 * In Flash, this provided file system cache for the AIR desktop client.
 * In the web version, implementations can use localStorage, IndexedDB,
 * or other persistent storage mechanisms.
 *
 * @see sources/win63_version/core/utils/class_67.as
 */
export interface IFileProxy
{
    /**
	 * Clear the entire cache.
	 */
    clearCache(): void;

    /**
	 * Check if a cached entry exists.
	 *
	 * @param key - Cache key
	 * @returns True if the entry exists
	 */
    cacheFileExists(key: string): boolean;

    /**
	 * Read a string from cache.
	 *
	 * @param key - Cache key
	 * @returns The cached string, or null if not found
	 */
    readCache(key: string): string | null;

    /**
	 * Write a string to cache.
	 *
	 * @param key - Cache key
	 * @param data - String data to cache
	 */
    writeCache(key: string, data: string): void;

    /**
	 * Delete a cache directory/prefix.
	 *
	 * @param prefix - The prefix to delete
	 */
    deleteCacheDirectory(prefix: string): void;
}
