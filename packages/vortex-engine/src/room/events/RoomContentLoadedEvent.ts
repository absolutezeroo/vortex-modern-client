/**
 * RoomContentLoadedEvent
 *
 * Dispatched when room content (furniture, placeholders, etc.) finishes loading.
 *
 * @see sources/win63_version/room/events/RoomContentLoadedEvent.as
 */
export class RoomContentLoadedEvent
{
    public static readonly CONTENT_LOAD_SUCCESS = 'RCLE_SUCCESS';
    public static readonly CONTENT_LOAD_FAILURE = 'RCLE_FAILURE';
    public static readonly CONTENT_LOAD_CANCEL = 'RCLE_CANCEL';

    private _contentType: string;

    constructor(contentType: string)
    {
        this._contentType = contentType;
    }

    get contentType(): string
    {
        return this._contentType;
    }
}
