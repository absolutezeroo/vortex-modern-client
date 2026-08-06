import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parser for sanction status messages.
 * Contains detailed information about a user's current sanction state.
 *
 * @see source_as_win63/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as
 */
export class SanctionStatusMessageParser implements IMessageParser
{
    private _isSanctionNew: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get isSanctionNew()
    get isSanctionNew(): boolean
    {
        return this._isSanctionNew;
    }

    private _isSanctionActive: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get isSanctionActive()
    get isSanctionActive(): boolean
    {
        return this._isSanctionActive;
    }

    private _sanctionName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get sanctionName()
    get sanctionName(): string
    {
        return this._sanctionName;
    }

    private _sanctionLengthHours: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get sanctionLengthHours()
    get sanctionLengthHours(): number
    {
        return this._sanctionLengthHours;
    }

    private _sanctionReason: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get sanctionReason()
    get sanctionReason(): string
    {
        return this._sanctionReason;
    }

    private _sanctionCreationTime: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get sanctionCreationTime()
    get sanctionCreationTime(): string
    {
        return this._sanctionCreationTime;
    }

    private _probationHoursLeft: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get probationHoursLeft()
    get probationHoursLeft(): number
    {
        return this._probationHoursLeft;
    }

    private _nextSanctionName: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get nextSanctionName()
    get nextSanctionName(): string
    {
        return this._nextSanctionName;
    }

    private _nextSanctionLengthHours: number = 0;

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get nextSanctionLengthHours()
    get nextSanctionLengthHours(): number
    {
        return this._nextSanctionLengthHours;
    }

    private _hasCustomMute: boolean = false;

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get hasCustomMute()
    get hasCustomMute(): boolean
    {
        return this._hasCustomMute;
    }

    private _tradeLockExpiryTime: string = '';

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::get tradeLockExpiryTime()
    get tradeLockExpiryTime(): string
    {
        return this._tradeLockExpiryTime;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::flush()
    flush(): boolean
    {
        this._isSanctionNew = false;
        this._isSanctionActive = false;
        this._sanctionName = '';
        this._sanctionLengthHours = 0;
        this._sanctionReason = '';
        this._sanctionCreationTime = '';
        this._probationHoursLeft = 0;
        this._nextSanctionName = '';
        this._nextSanctionLengthHours = 0;
        this._hasCustomMute = false;
        this._tradeLockExpiryTime = '';
        return true;
    }

    // AS3: sources/win63_version/habbo/communication/messages/parser/callforhelp/SanctionStatusEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._isSanctionNew = wrapper.readBoolean();
        this._isSanctionActive = wrapper.readBoolean();
        this._sanctionName = wrapper.readString();
        this._sanctionLengthHours = wrapper.readInt();
        wrapper.readInt(); // unused
        this._sanctionReason = wrapper.readString();
        this._sanctionCreationTime = wrapper.readString();
        this._probationHoursLeft = wrapper.readInt();
        this._nextSanctionName = wrapper.readString();
        this._nextSanctionLengthHours = wrapper.readInt();
        wrapper.readInt(); // unused
        this._hasCustomMute = wrapper.readBoolean();

        if(wrapper.bytesAvailable > 0)
        {
            this._tradeLockExpiryTime = wrapper.readString();
        }

        return true;
    }
}
