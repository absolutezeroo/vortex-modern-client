import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * RelationshipStatusInfo
 *
 * Based on AS3:
 * - com.sulake.habbo.communication.messages.incoming.users.class_1758
 * - com.sulake.habbo.communication.messages.incoming.users.RelationshipStatusInfo
 */
export class RelationshipStatusInfo
{
    private _relationshipStatusType: number;
    private _friendCount: number;
    private _randomFriendId: number;
    private _randomFriendName: string;
    private _randomFriendFigure: string;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._relationshipStatusType = wrapper.readInt();
        this._friendCount = wrapper.readInt();
        this._randomFriendId = wrapper.readInt();
        this._randomFriendName = wrapper.readString();
        this._randomFriendFigure = wrapper.readString();
    }

    get relationshipStatusType(): number
    {
        return this._relationshipStatusType;
    }

    get friendCount(): number
    {
        return this._friendCount;
    }

    get randomFriendId(): number
    {
        return this._randomFriendId;
    }

    get randomFriendName(): string
    {
        return this._randomFriendName;
    }

    get randomFriendFigure(): string
    {
        return this._randomFriendFigure;
    }
}
