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
    private _onDuty: boolean = false;

    get onDuty(): boolean
    {
        return this._onDuty;
    }

    private _guidesOnDuty: number = 0;

    get guidesOnDuty(): number
    {
        return this._guidesOnDuty;
    }

    private _helpersOnDuty: number = 0;

    get helpersOnDuty(): number
    {
        return this._helpersOnDuty;
    }

    private _guardiansOnDuty: number = 0;

    get guardiansOnDuty(): number
    {
        return this._guardiansOnDuty;
    }

    flush(): boolean
    {
        this._onDuty = false;
        this._guidesOnDuty = 0;
        this._helpersOnDuty = 0;
        this._guardiansOnDuty = 0;
        return true;
    }

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
