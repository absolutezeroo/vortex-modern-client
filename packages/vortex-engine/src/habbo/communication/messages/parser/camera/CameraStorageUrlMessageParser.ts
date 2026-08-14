import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The base URL the rendered photo can be fetched from.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/camera/CameraStorageUrlMessageEventParser.as
 * (`_SafePkg_4018/_SafeCls_4057` in the primary tree; header 2176 from WIN63's registry)
 */
export class CameraStorageUrlMessageParser implements IMessageParser
{
    // AS3: .../_SafePkg_4018/_SafeCls_4057.as::_SafeStr_5520
    private _url: string = '';

    // AS3: .../_SafePkg_4018/_SafeCls_4057.as::get url()
    get url(): string
    {
        return this._url;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4057.as::flush()
    flush(): boolean
    {
        this._url = '';

        return true;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4057.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._url = wrapper.readString();

        return true;
    }
}
