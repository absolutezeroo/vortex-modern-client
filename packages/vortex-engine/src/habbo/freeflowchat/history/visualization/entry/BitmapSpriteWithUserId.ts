import {Sprite, Texture} from 'pixi.js';

/**
 * BitmapSpriteWithUserId
 *
 * One drawn row inside the history tray: the entry's baked bitmap, plus the four identifiers the
 * scroll view needs once somebody clicks it — who said it, in which room, and whether they can be
 * ignored.
 *
 * The class is `_SafeCls_2999` in the primary tree and `class_2915` in `win63_version`; the name
 * here is **recovered**, from PRODUCTION's `BitmapSpriteWithUserId.as`, which is the same class one
 * build earlier. The 2016 copy carries a single `userId`; the 2026 one splits it into `userIndex`
 * (the room's index for the avatar) and `webId` (the account, for the ignore list), and this port
 * follows 2026.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as
 */
export class BitmapSpriteWithUserId extends Sprite
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::_canIgnore
    private _canIgnore: boolean = false;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::_userName
    private _userName: string = '';
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as::_userIndex
    private _userIndex: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as::_webId
    private _webId: number = 0;
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::_roomId
    private _roomId: number = 0;

    /**
     * AS3 inherits this from `flash.display.Bitmap`; PixiJS takes a `Texture` instead, so the
     * setter wraps the bitmap and clearing it hands back `Texture.EMPTY` rather than destroying
     * anything — the `ImageBitmap` belongs to the history entry in the buffer, which outlives every
     * sprite built from it (`deactivateView()` nulls this on rows it is about to throw away, and
     * `activateView()` builds fresh rows from the same entries).
     */
    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as::bitmapData (flash.display.Bitmap)
    set bitmapData(value: ImageBitmap | null)
    {
        this.texture = value === null ? Texture.EMPTY : Texture.from(value);
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::get canIgnore()
    get canIgnore(): boolean
    {
        return this._canIgnore;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::set canIgnore()
    set canIgnore(value: boolean)
    {
        this._canIgnore = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::get userName()
    get userName(): string
    {
        return this._userName;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::set userName()
    set userName(value: string)
    {
        this._userName = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as::get userIndex()
    get userIndex(): number
    {
        return this._userIndex;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as::set userIndex()
    set userIndex(value: number)
    {
        this._userIndex = value;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as::get webId()
    get webId(): number
    {
        return this._webId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/freeflowchat/history/visualization/entry/_SafeCls_2999.as::set webId()
    set webId(value: number)
    {
        this._webId = value;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/freeflowchat/history/visualization/entry/BitmapSpriteWithUserId.as::set roomId()
    set roomId(value: number)
    {
        this._roomId = value;
    }
}
