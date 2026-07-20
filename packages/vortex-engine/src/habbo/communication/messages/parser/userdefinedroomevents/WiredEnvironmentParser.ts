import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the room-wide "wired environment" push: whether a click-user wired is active
 * in the room, and the list of achievement codes wired furni can progress here.
 *
 * Name derived: this 2026 message has no counterpart in the older (de-obfuscated)
 * vortex-flash-client, so the name is derived from behaviour + WIN63's registry entry
 * `_SafeStr_4546[2827] = _SafeCls_3319` (WiredEnvironment reads it in onWiredEnvironmentEvent).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3496.as
 */
export class WiredEnvironmentParser implements IMessageParser
{
    private _hasClickUserWired: boolean = false;

    private _enabledAchievements: string[] = [];

    // AS3: _SafeCls_3496.as::get hasClickUserWired()
    get hasClickUserWired(): boolean
    {
        return this._hasClickUserWired;
    }

    // AS3: _SafeCls_3496.as::get enabledAchievements()
    get enabledAchievements(): string[]
    {
        return this._enabledAchievements;
    }

    // AS3: _SafeCls_3496.as::flush()
    flush(): boolean
    {
        this._hasClickUserWired = false;
        this._enabledAchievements = [];
        return true;
    }

    // AS3: _SafeCls_3496.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._hasClickUserWired = wrapper.readBoolean();
        this._enabledAchievements = [];

        if(wrapper.bytesAvailable > 0)
        {
            const count: number = wrapper.readInt();
            for(let i = 0; i < count; i++)
            {
                this._enabledAchievements.push(wrapper.readString());
            }
        }

        return true;
    }
}
