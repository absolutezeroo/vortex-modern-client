import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredLogPage} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredLogPage';

/**
 * WiredRoomLogsParser — parses a page of the wired room-logs (WIN63 header 1910) into a
 * {@link WiredLogPage}.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4191`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4026/_SafeCls_4191.as
 */
export class WiredRoomLogsParser implements IMessageParser
{
    // AS3: _SafeCls_4191.as::_SafeStr_4734 (name derived: the log page)
    private _page: WiredLogPage | null = null;

    // AS3: _SafeCls_4191.as::flush()
    flush(): boolean
    {
        this._page = null;
        return true;
    }

    // AS3: _SafeCls_4191.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._page = new WiredLogPage(wrapper);
        return true;
    }

    // AS3: _SafeCls_4191.as::get page()
    get page(): WiredLogPage
    {
        return this._page!;
    }
}
