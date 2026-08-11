import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One achievement level's badge-point limit.
 *
 * The badge id is *built*, not sent: the server groups levels under a prefix and sends the level
 * number, and the client concatenates `"ACH_" + prefix + level` to get the id the rest of the
 * localization layer keys on. That is why this reads from the wrapper mid-loop rather than taking
 * finished values.
 *
 * The AS3 class is obfuscated in every tree, so the class name here is DERIVED; both accessors
 * keep their real names.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3873.as
 */
export class BadgePointLimit
{
    // AS3: .../_SafeCls_3873.as::_SafeStr_5053 (name from `get badgeId()`)
    private _badgeId: string;

    // AS3: .../_SafeCls_3873.as::_limit
    private _limit: number;

    // AS3: .../_SafeCls_3873.as::_SafeCls_3873()
    constructor(badgeCodePrefix: string, wrapper: IMessageDataWrapper)
    {
        this._badgeId = `ACH_${badgeCodePrefix}${wrapper.readInt()}`;
        this._limit = wrapper.readInt();
    }

    // AS3: .../_SafeCls_3873.as::get badgeId()
    get badgeId(): string
    {
        return this._badgeId;
    }

    // AS3: .../_SafeCls_3873.as::get limit()
    get limit(): number
    {
        return this._limit;
    }
}
