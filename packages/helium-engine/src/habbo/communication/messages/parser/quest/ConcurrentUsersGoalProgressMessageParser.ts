import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Parses concurrent users goal progress data from the server.
 *
 * @see sources/win63_version/habbo/communication/messages/parser/quest/ConcurrentUsersGoalProgressMessageEventParser.as
 */
export class ConcurrentUsersGoalProgressMessageParser implements IMessageParser
{
    private _state: number = -1;

    get state(): number
    {
        return this._state;
    }

    private _userCount: number = -1;

    get userCount(): number
    {
        return this._userCount;
    }

    private _userCountGoal: number = -1;

    get userCountGoal(): number
    {
        return this._userCountGoal;
    }

    flush(): boolean
    {
        this._state = -1;
        this._userCount = -1;
        this._userCountGoal = -1;
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._state = wrapper.readInt();
        this._userCount = wrapper.readInt();
        this._userCountGoal = wrapper.readInt();
        return true;
    }
}
