import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {CfhReportStatusData} from './CfhReportStatusData';

/**
 * Every call-for-help this player has filed, answering GetMyCfhReportStatusMessageComposer.
 *
 * Body from the primary tree (`unknowns/_SafePkg_2056/_SafeCls_3848.as`). The `win63_version` copy,
 * which supplies the readable class name, has the decompiler's `while(0 < _loc2_)` with
 * `_loc3_ = 0 + 1` for a counter — a browser hang on any non-empty report list.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/callforhelp/MyCfhReportStatusMessageEventParser.as
 */
export class MyCfhReportStatusMessageEventParser implements IMessageParser
{
    private _messages: CfhReportStatusData[] | null = null;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_3848.as::get messages()
    get messages(): CfhReportStatusData[] | null
    {
        return this._messages;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_3848.as::flush()
    flush(): boolean
    {
        this._messages = null;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2056/_SafeCls_3848.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._messages = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._messages.push(new CfhReportStatusData(wrapper));
        }

        return true;
    }
}
