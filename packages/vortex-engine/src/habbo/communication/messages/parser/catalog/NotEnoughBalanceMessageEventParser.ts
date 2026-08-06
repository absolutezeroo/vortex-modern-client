import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for a catalog purchase rejected due to insufficient balance.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/catalog/NotEnoughBalanceMessageEventParser.as
 */
export class NotEnoughBalanceMessageEventParser implements IMessageParser
{
    private _notEnoughCredits: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/NotEnoughBalanceMessageEventParser.as::get notEnoughCredits()
    get notEnoughCredits(): boolean
    {
        return this._notEnoughCredits;
    }

    private _notEnoughActivityPoints: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/NotEnoughBalanceMessageEventParser.as::get notEnoughActivityPoints()
    get notEnoughActivityPoints(): boolean
    {
        return this._notEnoughActivityPoints;
    }

    private _activityPointType: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/NotEnoughBalanceMessageEventParser.as::get activityPointType()
    get activityPointType(): number
    {
        return this._activityPointType;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/NotEnoughBalanceMessageEventParser.as::flush()
    flush(): boolean
    {
        this._notEnoughCredits = false;
        this._notEnoughActivityPoints = false;
        this._activityPointType = 0;

        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/catalog/NotEnoughBalanceMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._notEnoughCredits = wrapper.readBoolean();
        this._notEnoughActivityPoints = wrapper.readBoolean();

        if(wrapper.bytesAvailable)
        {
            this._activityPointType = wrapper.readInt();
        }

        return true;
    }
}
