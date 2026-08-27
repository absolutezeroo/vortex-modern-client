import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the recycler's current system status (off/ready/waiting-for-server) push.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/RecyclerStatusMessageEventParser.as
 */
export class RecyclerStatusMessageEventParser implements IMessageParser
{
    private _recyclerStatus: number = -1;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2166/_SafeCls_2165.as::get recyclerStatus()
    get recyclerStatus(): number
    {
        return this._recyclerStatus;
    }

    private _recyclerTimeoutSeconds: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2166/_SafeCls_2165.as::get recyclerTimeoutSeconds()
    get recyclerTimeoutSeconds(): number
    {
        return this._recyclerTimeoutSeconds;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2166/_SafeCls_2165.as::flush()
    flush(): boolean
    {
        this._recyclerStatus = -1;
        this._recyclerTimeoutSeconds = 0;
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2166/_SafeCls_2165.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._recyclerStatus = wrapper.readInt();
        this._recyclerTimeoutSeconds = wrapper.readInt();
        return true;
    }
}
