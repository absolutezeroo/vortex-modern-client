import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * One habbicon changed hands, or was (un)favourited — header 2019
 * (`_SafeCls_2046.as::_events[2019]`).
 *
 * A state outside 1/2/3 means the player no longer holds it, and the controller deletes its entry.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4082/_SafeCls_4372.as
 */
export class UserHabbiconStatusChangedMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4372.as::_SafeStr_6120 (name derived: the habbicon id)
    private _habbiconId: number = 0;

    // AS3: _SafeCls_4372.as::_SafeStr_7519 (name derived: the new state)
    private _habbiconState: number = 0;

    // AS3: _SafeCls_4372.as::get habbiconId()
    get habbiconId(): number
    {
        return this._habbiconId;
    }

    // AS3: _SafeCls_4372.as::get habbiconState()
    get habbiconState(): number
    {
        return this._habbiconState;
    }

    // AS3: _SafeCls_4372.as::flush()
    flush(): boolean
    {
        this._habbiconId = 0;
        this._habbiconState = 0;

        return true;
    }

    // AS3: _SafeCls_4372.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._habbiconId = wrapper.readInt();
        this._habbiconState = wrapper.readInt();

        return true;
    }
}
