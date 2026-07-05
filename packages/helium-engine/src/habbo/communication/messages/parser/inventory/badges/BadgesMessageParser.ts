import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export interface BadgeData
{
    badgeId: string;
    slotId: number;
}

/**
 * Parser for badges list message
 *
 * @see source_as_win63/habbo/communication/messages/parser/inventory/badges/BadgesEventParser.as
 */
export class BadgesMessageParser implements IMessageParser
{
    private _totalFragments: number = 1;

    get totalFragments(): number
    {
        return this._totalFragments;
    }

    private _fragmentNo: number = 0;

    get fragmentNo(): number
    {
        return this._fragmentNo;
    }

    private _badges: BadgeData[] = [];

    get badges(): BadgeData[]
    {
        return this._badges;
    }

    private _activeBadgeIds: string[] = [];

    get activeBadgeIds(): string[]
    {
        return this._activeBadgeIds;
    }

    flush(): boolean
    {
        this._badges = [];
        this._activeBadgeIds = [];
        return true;
    }

    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._totalFragments = wrapper.readInt();
        this._fragmentNo = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const slotId = wrapper.readInt();
            const badgeId = wrapper.readString();

            this._badges.push({badgeId, slotId});

            if(slotId > 0)
            {
                this._activeBadgeIds.push(badgeId);
            }
        }

        return true;
    }
}
