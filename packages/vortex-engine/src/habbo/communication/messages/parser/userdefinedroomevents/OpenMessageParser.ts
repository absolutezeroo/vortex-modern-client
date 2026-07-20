import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for the server's "open wired config for this furni" push: the stuff (furni) id whose
 * wired configuration the client should request/open.
 *
 * Name recovered from vortex-flash-client: OpenMessageParser.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_2993.as
 */
export class OpenMessageParser implements IMessageParser
{
    private _stuffId: number = 0;

    // AS3: _SafeCls_2993.as::get stuffId()
    get stuffId(): number
    {
        return this._stuffId;
    }

    // AS3: _SafeCls_2993.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: _SafeCls_2993.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._stuffId = wrapper.readInt();

        return true;
    }
}
