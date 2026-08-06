import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {ExtendedProfileData} from '../../incoming/users/ExtendedProfileData';

/**
 * ExtendedProfileMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.ExtendedProfileMessageEventParser
 * - com.sulake.habbo.communication.messages.parser.users.ExtendedProfileMessageParser
 */
export class ExtendedProfileMessageParser implements IMessageParser
{
    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/parser/users/ExtendedProfileMessageParser.as::_data
    private _data: ExtendedProfileData | null = null;

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/parser/users/ExtendedProfileMessageParser.as::get data()
    get data(): ExtendedProfileData | null
    {
        return this._data;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/parser/users/ExtendedProfileMessageParser.as::flush()
    flush(): boolean
    {
        this._data = null;
        return true;
    }

    // AS3: sources/PRODUCTION-201601012205-226667486/src/com/sulake/habbo/communication/messages/parser/users/ExtendedProfileMessageParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._data = new ExtendedProfileData(wrapper);
        return true;
    }
}
