import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * RoomSettingsErrorMessageEventParser
 *
 * A room-settings error. Like `NoSuchFlat`, AS3 registers it and leaves the handler
 * body empty - it reads the parser into a local and discards it.
 *
 * Name recovered from the emulator's `RoomSettingsErrorComposer = 3715`; the AS3 class
 * is obfuscated in every available tree. Both members are recovered.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2452/_SafeCls_3416.as
 */
export class RoomSettingsErrorMessageEventParser implements IMessageParser
{
    // AS3: .../_SafeCls_3416.as::_SafeStr_6722
    private _roomId: number = 0;

    // AS3: .../_SafeCls_3416.as::_errorCode
    private _errorCode: number = 0;

    // AS3: .../_SafeCls_3416.as::get roomId()
    get roomId(): number
    {
        return this._roomId;
    }

    // AS3: .../_SafeCls_3416.as::get errorCode()
    get errorCode(): number
    {
        return this._errorCode;
    }

    // AS3: .../_SafeCls_3416.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_3416.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._roomId = wrapper.readInt();
        this._errorCode = wrapper.readInt();

        return true;
    }
}
