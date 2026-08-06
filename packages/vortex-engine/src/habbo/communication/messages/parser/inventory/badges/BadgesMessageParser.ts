import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

export interface IBadgeData
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

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/badges/BadgesEventParser.as::get totalFragments()
    get totalFragments(): number
    {
        return this._totalFragments;
    }

    private _fragmentNo: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/badges/BadgesEventParser.as::get fragmentNo()
    get fragmentNo(): number
    {
        return this._fragmentNo;
    }

    private _badges: IBadgeData[] = [];

    get badges(): IBadgeData[]
    {
        return this._badges;
    }

    private _activeBadgeIds: string[] = [];

    get activeBadgeIds(): string[]
    {
        return this._activeBadgeIds;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/badges/BadgesEventParser.as::flush()
    flush(): boolean
    {
        this._badges = [];
        this._activeBadgeIds = [];
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/inventory/badges/BadgesEventParser.as::parse()
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
