import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Whether the current user has already submitted a room to a competition,
 * and if so which room.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/competition/IsUserPartOfCompetitionMessageEventParser.as
 */
export class IsUserPartOfCompetitionMessageEventParser implements IMessageParser
{
    private _isPartOf: boolean = false;
    private _targetId: number = 0;

    flush(): boolean
    {
        this._isPartOf = false;
        this._targetId = 0;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._isPartOf = wrapper.readBoolean();
        this._targetId = wrapper.readInt();
        return true;
    }

    get isPartOf(): boolean
    {
        return this._isPartOf;
    }

    get targetId(): number
    {
        return this._targetId;
    }
}
