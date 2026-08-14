import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The camera's prices, sent in response to RequestCameraConfiguration (3010).
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/camera/InitCameraMessageEventParser.as
 * (`_SafePkg_4018/_SafeCls_4393` in the primary tree, whose body this follows; header 2768 from
 * WIN63's registry)
 */
export class InitCameraMessageParser implements IMessageParser
{
    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::_SafeStr_7565
    private _creditPrice: number = 0;

    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::_SafeStr_8180
    private _ducketPrice: number = 0;

    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::_SafeStr_8334
    private _publishDucketPrice: number = 0;

    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::getCreditPrice()
    getCreditPrice(): number
    {
        return this._creditPrice;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::getDucketPrice()
    getDucketPrice(): number
    {
        return this._ducketPrice;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::getPublishDucketPrice()
    getPublishDucketPrice(): number
    {
        return this._publishDucketPrice;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::flush()
    flush(): boolean
    {
        this._creditPrice = 0;
        this._ducketPrice = 0;
        this._publishDucketPrice = 0;

        return true;
    }

    // AS3: .../_SafePkg_4018/_SafeCls_4393.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._creditPrice = wrapper.readInt();
        this._ducketPrice = wrapper.readInt();

        // The third price is optional on the wire — older servers stop after two.
        if(wrapper.bytesAvailable > 0)
        {
            this._publishDucketPrice = wrapper.readInt();
        }

        return true;
    }
}
