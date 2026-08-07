import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The sanction a moderator issue ended in.
 *
 * The last two fields are optional on the wire — AS3 reads them only `if(bytesAvailable)`, so an
 * older server that sends neither is not a parse error.
 *
 * AS3: sources/win63_version/habbo/communication/messages/incoming/callforhelp/class_3472.as
 * (obfuscated in both trees; named after the accessor `sanctionType` that returns it)
 */
export class SanctionTypeData
{
    // AS3: .../class_3472.as::get name()
    readonly name: string;

    // AS3: .../class_3472.as::get sanctionLengthInHours()
    readonly sanctionLengthInHours: number;

    /**
     * AS3: .../class_3472.as::class_3472()
     * The third int has no getter in AS3 at all — it is read off the wire and then unreachable.
     * Kept as a field so the read order stays right and the value is not simply lost.
     */
    readonly probationLengthInHours: number;

    // AS3: .../class_3472.as::get avatarOnly()
    readonly avatarOnly: boolean;

    // AS3: .../class_3472.as::get tradeLockInfo()
    readonly tradeLockInfo: string;

    // AS3: .../class_3472.as::get machineBanInfo()
    readonly machineBanInfo: string;

    constructor(wrapper: IMessageDataWrapper)
    {
        this.name = wrapper.readString();
        this.sanctionLengthInHours = wrapper.readInt();
        this.probationLengthInHours = wrapper.readInt();
        this.avatarOnly = wrapper.readBoolean();
        this.tradeLockInfo = wrapper.bytesAvailable ? wrapper.readString() : '';
        this.machineBanInfo = wrapper.bytesAvailable ? wrapper.readString() : '';
    }
}

/**
 * Which issue was sanctioned, against whom, and with what.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/CfhSanctionMessageEventParser.as
 * (obfuscated as `_SafeCls_2679`'s parser in the primary tree)
 */
export class CfhSanctionMessageParser implements IMessageParser
{
    private _issueId: number = -1;

    // AS3: .../CfhSanctionMessageEventParser.as::get issueId()
    get issueId(): number
    {
        return this._issueId;
    }

    private _accountId: number = -1;

    // AS3: .../CfhSanctionMessageEventParser.as::get accountId()
    get accountId(): number
    {
        return this._accountId;
    }

    private _sanctionType: SanctionTypeData | null = null;

    // AS3: .../CfhSanctionMessageEventParser.as::get sanctionType()
    get sanctionType(): SanctionTypeData | null
    {
        return this._sanctionType;
    }

    // AS3: .../CfhSanctionMessageEventParser.as::flush()
    flush(): boolean
    {
        this._issueId = -1;
        this._accountId = -1;
        this._sanctionType = null;

        return true;
    }

    // AS3: .../CfhSanctionMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._issueId = wrapper.readInt();
        this._accountId = wrapper.readInt();
        this._sanctionType = new SanctionTypeData(wrapper);

        return true;
    }
}
