/**
 * Error Report Storage
 *
 * Static storage for debug and error data that can be sent with crash reports.
 *
 * @see sources/win63_version/core/utils/ErrorReportStorage.as
 */
export class ErrorReportStorage
{
    private static _data: Map<string, string> = new Map();

    static setDebugData(key: string, value: string): void
    {
        this._data.set(key, value);
    }

    static getDebugData(key: string): string | null
    {
        return this._data.get(key) ?? null;
    }

    static removeDebugData(key: string): void
    {
        this._data.delete(key);
    }

    static getAllDebugData(): Map<string, string>
    {
        return new Map(this._data);
    }

    static clear(): void
    {
        this._data.clear();
    }
}
