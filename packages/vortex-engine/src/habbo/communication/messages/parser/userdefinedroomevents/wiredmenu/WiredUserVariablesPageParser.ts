import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {WiredUserVariablesPage} from '@habbo/communication/messages/incoming/userdefinedroomevents/wiredmenu/WiredUserVariablesPage';

/**
 * WiredUserVariablesPageParser — parses a page of the variable-management overview (WIN63 header 749)
 * into a {@link WiredUserVariablesPage}.
 *
 * Name derived: fully obfuscated in AS3 (class `_SafeCls_4429`); named for its role.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4074/_SafeCls_4429.as
 */
export class WiredUserVariablesPageParser implements IMessageParser
{
    // AS3: _SafeCls_4429.as::_SafeStr_4734 (name derived: the page)
    private _page: WiredUserVariablesPage | null = null;

    // AS3: _SafeCls_4429.as::flush()
    flush(): boolean
    {
        this._page = null;
        return true;
    }

    // AS3: _SafeCls_4429.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._page = new WiredUserVariablesPage(wrapper);
        return true;
    }

    // AS3: _SafeCls_4429.as::get page()
    get page(): WiredUserVariablesPage
    {
        return this._page!;
    }
}
