import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One badge's rarity and how many people hold it.
 *
 * Class name DERIVED: the AS3 file is `_SafeCls_4369.as` and the identifier exists in no tree.
 * Named after its four readable accessors.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3206/_SafeCls_4369.as
 */
export class BadgeInformationParser implements IMessageParser
{
    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::_badgeId
    private _badgeId: number = 0;

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::_badgeCode
    private _badgeCode: string = '';

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::_ownerCount
    private _ownerCount: number = 0;

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::_badgeRarityId
    private _badgeRarityId: number = 0;

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::get badgeId()
    get badgeId(): number
    {
        return this._badgeId;
    }

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::get badgeCode()
    get badgeCode(): string
    {
        return this._badgeCode;
    }

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::get ownerCount()
    get ownerCount(): number
    {
        return this._ownerCount;
    }

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::get badgeRarityId()
    get badgeRarityId(): number
    {
        return this._badgeRarityId;
    }

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::flush()
    flush(): boolean
    {
        this._badgeId = 0;
        this._badgeCode = '';
        this._ownerCount = 0;
        this._badgeRarityId = 0;

        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_3206/_SafeCls_4369.as::parse()
    // Owner count comes *before* the rarity on the wire, which the accessor order hides.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._badgeId = wrapper.readInt();
        this._badgeCode = wrapper.readString();
        this._ownerCount = wrapper.readInt();
        this._badgeRarityId = wrapper.readInt();

        return true;
    }
}
