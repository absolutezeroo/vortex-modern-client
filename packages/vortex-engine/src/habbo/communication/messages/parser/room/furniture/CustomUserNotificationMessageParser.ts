import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Parses the one-integer notification the server sends when a furniture use is refused, or a
 * respect vote fails.
 *
 * The code is read by two handlers, which slice it differently: codes 1..5 open a dialog in
 * `CustomUserNotificationWidgetHandler`, and codes 4..5 additionally make
 * `AvatarInfoWidgetHandler` refund the failed respect.
 *
 * **Derived name**, from the emulator's `CustomUserNotificationMessageComposer = 169` — the class
 * is `_SafeCls_4382` in the primary tree and absent from the other two.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4382.as
 */
export class CustomUserNotificationMessageParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4382.as::_code
    private _code: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4382.as::get code()
    get code(): number
    {
        return this._code;
    }

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4382.as::flush()
     *
     * Returns true without clearing `_code`, as AS3 does.
     */
    // AS3: .../src/unknowns/_SafePkg_2942/_SafeCls_4382.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2942/_SafeCls_4382.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(wrapper == null)
        {
            return false;
        }

        this._code = wrapper.readInt();

        return true;
    }
}
