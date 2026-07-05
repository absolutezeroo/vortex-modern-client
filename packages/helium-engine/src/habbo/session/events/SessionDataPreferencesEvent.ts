/**
 * Session data preferences event
 *
 * @see source_as_win63/habbo/session/events/SessionDataPreferencesEvent.as
 */
export class SessionDataPreferencesEvent
{
    public static readonly PREFERENCES_UPDATED = 'APUE_UPDATED';

    constructor(uiFlags: number)
    {
        this._uiFlags = uiFlags;
    }

    private _uiFlags: number;

    get uiFlags(): number
    {
        return this._uiFlags;
    }
}
