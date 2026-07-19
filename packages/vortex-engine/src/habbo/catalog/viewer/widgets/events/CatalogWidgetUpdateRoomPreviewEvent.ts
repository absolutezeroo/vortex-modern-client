/**
 * Fired on the widget event bus to update the "spaces" room preview (wall/floor/landscape).
 *
 * @see sources/win63_2026_crypted_version/src/com/sulake/habbo/catalog/viewer/widgets/events/CatalogWidgetUpdateRoomPreviewEvent.as
 */
export class CatalogWidgetUpdateRoomPreviewEvent
{
    static readonly UPDATE_ROOM_PREVIEW: string = 'UPDATE_ROOM_PREVIEW';

    private _floorType: string;
    private _wallType: string;
    private _landscapeType: string;
    private _tileSize: number;

    constructor(floorType: string, wallType: string, landscapeType: string, tileSize: number)
    {
        this._floorType = floorType;
        this._wallType = wallType;
        this._landscapeType = landscapeType;
        this._tileSize = tileSize;
    }

    get type(): string
    {
        return CatalogWidgetUpdateRoomPreviewEvent.UPDATE_ROOM_PREVIEW;
    }

    get floorType(): string
    {
        return this._floorType;
    }

    get wallType(): string
    {
        return this._wallType;
    }

    get landscapeType(): string
    {
        return this._landscapeType;
    }

    get tileSize(): number
    {
        return this._tileSize;
    }
}
