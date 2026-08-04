import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * RequestSpamWallPostItMessageParser
 *
 * The server asking the client to open a blank post-it editor for a wall item it has just
 * placed. Only the item and where it went - the note's text and colour are the client's to
 * choose, and come back on `AddSpamWallPostIt`.
 *
 * Name recovered from the emulator's `RequestSpamWallPostItMessageComposer = 2816`; the AS3
 * class is obfuscated in every available tree. Both members are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4325.as
 */
export class RequestSpamWallPostItMessageParser implements IMessageParser
{
    // AS3: .../_SafeCls_4325.as::_SafeStr_7108
    private _itemId: number = 0;

    // AS3: .../_SafeCls_4325.as::_SafeStr_5184
    private _location: string = '';

    // AS3: .../_SafeCls_4325.as::get itemId()
    get itemId(): number
    {
        return this._itemId;
    }

    // AS3: .../_SafeCls_4325.as::get location()
    get location(): string
    {
        return this._location;
    }

    // AS3: .../_SafeCls_4325.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_4325.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._itemId = wrapper.readInt();
        this._location = wrapper.readString();

        return true;
    }
}
