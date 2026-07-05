/**
 * ObjectMouseData
 *
 * Based on AS3: com.sulake.room.renderer.utils.ObjectMouseData
 *
 * Tracks mouse hover state for a room object.
 * Stores the object identifier and the sprite tag currently under the mouse.
 *
 * @see sources/flash_version/com/sulake/room/renderer/utils/ObjectMouseData.as
 */
export class ObjectMouseData
{
    private _objectId: string = '';

    get objectId(): string
    {
        return this._objectId;
    }

    set objectId(value: string)
    {
        this._objectId = value;
    }

    private _spriteTag: string = '';

    get spriteTag(): string
    {
        return this._spriteTag;
    }

    set spriteTag(value: string)
    {
        this._spriteTag = value;
    }
}
