import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Somebody in the room used a habbicon — header 1547 (`_SafeCls_2046.as::_events[1547]`).
 *
 * **The room index comes first, the habbicon id second** — the reverse of every other habbicon
 * message, where the id leads. Reading them the natural way round would attribute the icon to the
 * wrong avatar without ever failing.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2184/_SafeCls_4246.as
 */
export class RoomUseHabbiconMessageParser implements IMessageParser
{
    // AS3: _SafeCls_4246.as::_SafeStr_7722 (name derived: the room object index)
    private _roomIndex: number = 0;

    // AS3: _SafeCls_4246.as::_SafeStr_6120 (name derived: the habbicon id)
    private _habbiconId: number = 0;

    // AS3: _SafeCls_4246.as::get roomIndex()
    get roomIndex(): number
    {
        return this._roomIndex;
    }

    // AS3: _SafeCls_4246.as::get habbiconId()
    get habbiconId(): number
    {
        return this._habbiconId;
    }

    // AS3: _SafeCls_4246.as::flush()
    flush(): boolean
    {
        this._roomIndex = 0;
        this._habbiconId = 0;

        return true;
    }

    // AS3: _SafeCls_4246.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomIndex = wrapper.readInt();
        this._habbiconId = wrapper.readInt();

        return true;
    }
}
