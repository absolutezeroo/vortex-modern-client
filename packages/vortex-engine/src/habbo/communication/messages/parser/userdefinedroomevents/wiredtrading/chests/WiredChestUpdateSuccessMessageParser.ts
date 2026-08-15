import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Header 1957. A chest setting was saved. The boolean says *which* settings screen it answers — the chest
 * settings or the notification preferences — because both save through the same reply.
 *
 * **Name DERIVED** — no unobfuscated tree carries the wired-chest messages and vortex-emulator has
 * no constant for 1957. Named for the AS3 handler it feeds.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/chests/_SafeCls_4383.as
 */
export class WiredChestUpdateSuccessMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4383.as::chestId
    private _chestId: number = 0;
    // AS3: _SafeCls_4383.as::isNotificationPreferences
    private _isNotificationPreferences: boolean = false;

    // AS3: _SafeCls_4383.as::get chestId()
    get chestId(): number
    {
        return this._chestId;
    }

    // AS3: _SafeCls_4383.as::get isNotificationPreferences()
    get isNotificationPreferences(): boolean
    {
        return this._isNotificationPreferences;
    }

    // AS3: _SafeCls_4383.as::flush()
    flush(): boolean
    {
        this._chestId = 0;
        this._isNotificationPreferences = false;

        return true;
    }

    // AS3: _SafeCls_4383.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._chestId = wrapper.readInt();
        this._isNotificationPreferences = wrapper.readBoolean();

        return true;
    }
}
