import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Header 1022. A chest's coin balance. `isUpdate` distinguishes a change from the initial value, which is what
 * lets the view animate one and not the other.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 1022. Named for the AS3 handler it feeds.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/_SafeCls_4438.as
 */
export class WiredChestCoinsMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4438.as::chestId
    private _chestId: number = 0;
    // AS3: _SafeCls_4438.as::coins
    private _coins: number = 0;
    // AS3: _SafeCls_4438.as::isUpdate
    private _isUpdate: boolean = false;

    // AS3: _SafeCls_4438.as::get chestId()
    get chestId(): number
    {
        return this._chestId;
    }

    // AS3: _SafeCls_4438.as::get coins()
    get coins(): number
    {
        return this._coins;
    }

    // AS3: _SafeCls_4438.as::get isUpdate()
    get isUpdate(): boolean
    {
        return this._isUpdate;
    }

    // AS3: _SafeCls_4438.as::flush()
    flush(): boolean
    {
        this._chestId = 0;
        this._coins = 0;
        this._isUpdate = false;

        return true;
    }

    // AS3: _SafeCls_4438.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chestId = wrapper.readInt();
        this._coins = wrapper.readInt();
        this._isUpdate = wrapper.readBoolean();

        return true;
    }
}
