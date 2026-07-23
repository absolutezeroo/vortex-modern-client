import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredRoomStatsData} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredRoomStatsData';

/**
 * WiredRoomStatsParser — parses the monitor tab's room-stats push into a WiredRoomStatsData.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4013`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/wiredmenu/_SafeCls_4013.as
 */
export class WiredRoomStatsParser implements IMessageParser
{
    // AS3: _SafeCls_4013.as::_SafeStr_4629 (name derived: room stats)
    private _roomStats: WiredRoomStatsData | null = null;

    // AS3: _SafeCls_4013.as::flush()
    flush(): boolean
    {
        this._roomStats = null;
        return true;
    }

    // AS3: _SafeCls_4013.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._roomStats = new WiredRoomStatsData(wrapper);
        return true;
    }

    // AS3: _SafeCls_4013.as::get roomStats()
    get roomStats(): WiredRoomStatsData
    {
        return this._roomStats!;
    }
}
