import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * Whether the room thumbnail render succeeded, and whether the render quota is exhausted.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/camera/ThumbnailStatusMessageEventParser.as
 * (`_SafePkg_4018/_SafeCls_4248` in the primary tree; header 1325 from WIN63's registry)
 */
export class ThumbnailStatusMessageParser implements IMessageParser
{
    /**
	 * Defaults to `true`, alone among the camera parsers: a payload-less message means success, so
	 * the empty-body branch in `parse()` below leaves it set.
	 */
    // AS3: .../_SafePkg_4018/_SafeCls_4248.as::_SafeStr_7505
    private _ok: boolean = true;

    // AS3: .../_SafePkg_4018/_SafeCls_4248.as::_SafeStr_7827
    private _renderLimitHit: boolean = false;

    // AS3: .../_SafePkg_4018/_SafeCls_4248.as::isOk()
    isOk(): boolean
    {
        return this._ok;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4248.as::isRenderLimitHit()
    isRenderLimitHit(): boolean
    {
        return this._renderLimitHit;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4248.as::flush()
    flush(): boolean
    {
        this._ok = true;
        this._renderLimitHit = false;

        return true;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4248.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        if(wrapper.bytesAvailable)
        {
            this._ok = wrapper.readBoolean();
            this._renderLimitHit = wrapper.readBoolean();
        }

        return true;
    }
}
