import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for builders club subscription status message
 *
 * @see source_as_win63/habbo/communication/messages/parser/catalog/BuildersClubSubscriptionStatusMessageEventParser.as
 */
export class BuildersClubSubscriptionStatusMessageParser implements IMessageParser
{
    private _secondsLeft: number = 0;

    get secondsLeft(): number
    {
        return this._secondsLeft;
    }

    private _furniLimit: number = 0;

    get furniLimit(): number
    {
        return this._furniLimit;
    }

    private _maxFurniLimit: number = 0;

    get maxFurniLimit(): number
    {
        return this._maxFurniLimit;
    }

    private _secondsLeftWithGrace: number = 0;

    get secondsLeftWithGrace(): number
    {
        return this._secondsLeftWithGrace;
    }

    flush(): boolean
    {
        this._secondsLeft = 0;
        this._furniLimit = 0;
        this._maxFurniLimit = 0;
        this._secondsLeftWithGrace = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._secondsLeft = wrapper.readInt();
        this._furniLimit = wrapper.readInt();
        this._maxFurniLimit = wrapper.readInt();
        if(wrapper.bytesAvailable > 0)
        {
            this._secondsLeftWithGrace = wrapper.readInt();
        }
        else
        {
            this._secondsLeftWithGrace = this._secondsLeft;
        }
        return true;
    }
}
