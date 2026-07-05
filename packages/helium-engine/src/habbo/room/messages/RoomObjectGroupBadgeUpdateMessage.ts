/**
 * RoomObjectGroupBadgeUpdateMessage
 *
 * @see source_as_win63/habbo/room/messages/RoomObjectGroupBadgeUpdateMessage.as
 *
 * Update message for group badge assets on room objects.
 */
import {RoomObjectUpdateMessage} from '@room/messages/RoomObjectUpdateMessage';

export class RoomObjectGroupBadgeUpdateMessage extends RoomObjectUpdateMessage
{
    public static readonly BADGE_LOADED = 'ROGBUM_BADGE_LOADED';

    constructor(badgeId: string, assetName: string)
    {
        super(null, null);
        this._badgeId = badgeId;
        this._assetName = assetName;
    }

    private _badgeId: string;

    get badgeId(): string
    {
        return this._badgeId;
    }

    private _assetName: string;

    get assetName(): string
    {
        return this._assetName;
    }
}
