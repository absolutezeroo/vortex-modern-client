import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {WiredValidationErrorParameter} from '@habbo/communication/messages/incoming/userdefinedroomevents/WiredValidationErrorParameter';

/**
 * Parser for a wired save/validation failure: a localization key plus a list of key/value
 * substitution parameters ({@link WiredValidationErrorParameter}) to build the localized message.
 *
 * Name recovered from vortex-flash-client: WiredValidationErrorParser (older revision carried a
 * single `info` string; WIN63 sends localizationKey + parameters, ported here).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/messages/parser/userdefinedroomevents/_SafeCls_3324.as
 */
export class WiredValidationErrorParser implements IMessageParser
{
    private _localizationKey: string = '';

    private _parameters: WiredValidationErrorParameter[] = [];

    // AS3: _SafeCls_3324.as::get localizationKey()
    get localizationKey(): string
    {
        return this._localizationKey;
    }

    // AS3: _SafeCls_3324.as::get parameters()
    get parameters(): WiredValidationErrorParameter[]
    {
        return this._parameters;
    }

    // AS3: _SafeCls_3324.as::flush()
    flush(): boolean
    {
        this._localizationKey = '';
        this._parameters = [];
        return true;
    }

    // AS3: _SafeCls_3324.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._localizationKey = wrapper.readString();
        this._parameters = [];

        const count: number = wrapper.readInt();
        for(let i = 0; i < count; i++)
        {
            this._parameters.push(new WiredValidationErrorParameter(wrapper));
        }

        return true;
    }
}
