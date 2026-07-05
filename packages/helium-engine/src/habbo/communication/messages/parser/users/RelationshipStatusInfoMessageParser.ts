import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {RelationshipStatusInfo} from '../../incoming/users/RelationshipStatusInfo';

/**
 * RelationshipStatusInfoMessageParser
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.parser.users.RelationshipStatusInfoEventParser
 * - com.sulake.habbo.communication.messages.parser.users.RelationshipStatusInfoMessageParser
 */
export class RelationshipStatusInfoMessageParser implements IMessageParser
{
    private _userId: number = 0;
    private _relationshipStatusMap: Map<number, RelationshipStatusInfo> = new Map();

    get userId(): number
    {
        return this._userId;
    }

    get relationshipStatusMap(): Map<number, RelationshipStatusInfo>
    {
        return this._relationshipStatusMap;
    }

    flush(): boolean
    {
        this._relationshipStatusMap.clear();
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userId = wrapper.readInt();
        this._relationshipStatusMap.clear();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const info = new RelationshipStatusInfo(wrapper);

            this._relationshipStatusMap.set(info.relationshipStatusType, info);
        }

        return true;
    }
}
