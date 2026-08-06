import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for guide on-duty status messages.
 * Contains the current duty status and counts of active guides/guardians.
 *
 * @see source_as_win63/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as
 */
export class GuideOnDutyStatusMessageParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as::_onDuty
    private _onDuty: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as::get onDuty()
    get onDuty(): boolean
    {
        return this._onDuty;
    }

    private _guidesOnDuty: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as::get guidesOnDuty()
    get guidesOnDuty(): number
    {
        return this._guidesOnDuty;
    }

    private _helpersOnDuty: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as::get helpersOnDuty()
    get helpersOnDuty(): number
    {
        return this._helpersOnDuty;
    }

    private _guardiansOnDuty: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as::get guardiansOnDuty()
    get guardiansOnDuty(): number
    {
        return this._guardiansOnDuty;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as::flush()
    flush(): boolean
    {
        this._onDuty = false;
        this._guidesOnDuty = 0;
        this._helpersOnDuty = 0;
        this._guardiansOnDuty = 0;
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/help/GuideOnDutyStatusMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._onDuty = wrapper.readBoolean();
        this._guidesOnDuty = wrapper.readInt();
        this._helpersOnDuty = wrapper.readInt();
        this._guardiansOnDuty = wrapper.readInt();

        return true;
    }
}
