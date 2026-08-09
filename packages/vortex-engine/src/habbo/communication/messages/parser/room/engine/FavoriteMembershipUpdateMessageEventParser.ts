import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * @see sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as
 */
export class FavoriteMembershipUpdateMessageEventParser implements IMessageParser
{
    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::get roomIndex()
    private _roomIndex: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::get habboGroupId()
    private _habboGroupId: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::_status
    private _status: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::_habboGroupName
    private _habboGroupName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::get roomIndex()
    get roomIndex(): number
    {
        return this._roomIndex;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::get habboGroupId()
    get habboGroupId(): number
    {
        return this._habboGroupId;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::get status()
    get status(): number
    {
        return this._status;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::get habboGroupName()
    get habboGroupName(): string
    {
        return this._habboGroupName;
    }

    /**
     * AS3's `flush()` is an empty `return true` here - it does not reset the four fields. Kept as
     * written: the parser is only ever read straight after a `parse()`, so the stale values are
     * never observable, and resetting would be a silent divergence rather than a fix.
     */
    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/room/engine/FavoriteMembershipUpdateMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomIndex = wrapper.readInt();
        this._habboGroupId = wrapper.readInt();
        this._status = wrapper.readInt();
        this._habboGroupName = wrapper.readString();

        return true;
    }
}
