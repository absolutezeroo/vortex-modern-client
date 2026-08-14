import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether the photo was published, and how long before the next publish is allowed.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/camera/CameraPublishStatusMessageEventParser.as
 * (`_SafePkg_4018/_SafeCls_4017` in the primary tree; header 203 from WIN63's registry)
 */
export class CameraPublishStatusMessageParser implements IMessageParser
{
    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::_SafeStr_7505
    private _ok: boolean = false;

    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::_SafeStr_8029
    private _secondsToWait: number = 0;

    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::_SafeStr_8162
    private _extraDataId: string | null = null;

    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::isOk()
    isOk(): boolean
    {
        return this._ok;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::getSecondsToWait()
    getSecondsToWait(): number
    {
        return this._secondsToWait;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::getExtraDataId()
    getExtraDataId(): string | null
    {
        return this._extraDataId;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::flush()
    flush(): boolean
    {
        this._ok = false;
        this._secondsToWait = 0;
        this._extraDataId = null;

        return true;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4017.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._ok = wrapper.readBoolean();
        this._secondsToWait = wrapper.readInt();

        // The id is only present on success, and only on servers that send it.
        if(this._ok && wrapper.bytesAvailable)
        {
            this._extraDataId = wrapper.readString();
        }

        return true;
    }
}
