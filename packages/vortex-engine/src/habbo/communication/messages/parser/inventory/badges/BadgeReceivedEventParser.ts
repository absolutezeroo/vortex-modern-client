import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * A single badge the server just granted to this user (header 2840).
 *
 * Two independent consumers read it: the inventory badge model (so the new badge shows up in
 * the badges tab without a full re-list) and the notification handler (the "you got a badge"
 * toast).
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as
 * (obfuscated in the primary dump; the class name is recovered from
 * sources/win63_version/habbo/communication/messages/parser/inventory/badges/BadgeReceivedEventParser.as,
 * and the registry entry is `_SafeStr_4546[2840] = _SafeCls_3204` in
 * sources/WIN63-202607011411-782849652/src/com/sulake/habbo/communication/_SafeCls_2046.as:1467.)
 */
export class BadgeReceivedEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::badgeId
    private _badgeId: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::badgeCode
    private _badgeCode: string = '';
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::ownerCount
    private _ownerCount: number = 0;
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::badgeRarityId
    private _badgeRarityId: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::flush()
    // AS3 returns true without clearing anything; the fields are reset here for parity with the
    // rest of this port's parsers, which all zero themselves in flush().
    flush(): boolean
    {
        this._badgeId = 0;
        this._badgeCode = '';
        this._ownerCount = 0;
        this._badgeRarityId = 0;

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._badgeId = wrapper.readInt();
        this._badgeCode = wrapper.readString();
        this._ownerCount = wrapper.readInt();
        this._badgeRarityId = wrapper.readInt();

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::get badgeId()
    get badgeId(): number
    {
        return this._badgeId;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::get ownerCount()
    get ownerCount(): number
    {
        return this._ownerCount;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_3771.as::get badgeRarityId()
    get badgeRarityId(): number
    {
        return this._badgeRarityId;
    }
}
