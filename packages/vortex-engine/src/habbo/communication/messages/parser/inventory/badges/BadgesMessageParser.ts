import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * One badge as the list sends it. All four members are AS3's, from the Badge the parser builds —
 * `badgeId` is its `badgeCode` (a string here, as on the wire).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2931/_SafeCls_3762.as
 */
export interface IBadgeData
{
    // AS3: .../src/unknowns/_SafePkg_2931/_SafeCls_3762.as::get badgeCode()
    badgeId: string;
    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_3564.as::parse() (the first int of each badge)
    slotId: number;
    // AS3: .../src/unknowns/_SafePkg_2931/_SafeCls_3762.as::get ownerCount()
    ownerCount: number;
    // AS3: .../src/unknowns/_SafePkg_2931/_SafeCls_3762.as::get badgeRarityId()
    badgeRarityId: number;
}

/**
 * The player's badge list (header 2748).
 *
 * Four fields per badge, not two. `win63_version`'s decompile of this parser is one of the
 * corrupted ones — `while(0 < _loc5_)` with the counter never tested, and `add(null,0)` throwing
 * both values away — so the read order below comes from the primary tree, where the loop builds a
 * Badge from all four.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3564.as
 */
export class BadgesMessageParser implements IMessageParser
{
    private _totalFragments: number = 1;

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_3564.as::get totalFragments()
    get totalFragments(): number
    {
        return this._totalFragments;
    }

    private _fragmentNo: number = 0;

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_3564.as::get fragmentNo()
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

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_3564.as::flush()
    flush(): boolean
    {
        this._badges = [];
        this._activeBadgeIds = [];
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3564.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._totalFragments = wrapper.readInt();
        this._fragmentNo = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const slotId = wrapper.readInt();
            const badgeId = wrapper.readString();
            const ownerCount = wrapper.readInt();
            const badgeRarityId = wrapper.readInt();

            this._badges.push({badgeId, slotId, ownerCount, badgeRarityId});

            if(slotId > 0)
            {
                this._activeBadgeIds.push(badgeId);
            }
        }

        return true;
    }
}
