import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * NoSuchFlatMessageEventParser
 *
 * The requested room does not exist. AS3's navigator registers this and its handler
 * body is empty, so the id is parsed and nothing is done with it.
 *
 * Name recovered from the emulator's `NoSuchFlatComposer = 1122`; the AS3 class is
 * obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1710/_SafeCls_4335.as
 */
export class NoSuchFlatMessageEventParser implements IMessageParser
{
    // AS3: .../_SafeCls_4335.as::_flatId
    private _flatId: number = 0;

    // AS3: .../_SafeCls_4335.as::get flatId()
    get flatId(): number
    {
        return this._flatId;
    }

    // AS3: .../_SafeCls_4335.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_4335.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._flatId = wrapper.readInt();

        return true;
    }
}
