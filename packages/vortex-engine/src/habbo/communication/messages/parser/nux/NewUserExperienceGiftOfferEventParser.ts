import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NewUserExperienceGiftOptions} from './NewUserExperienceGiftOptions';

/**
 * Parses the NUX gift offer: a length-prefixed list of per-step option sets.
 *
 * Name recovered from `sources/win63_version/habbo/communication/messages/parser/nux/NewUserExperienceGiftOfferEventParser.as`,
 * which is unobfuscated there; the class itself is `_SafeCls_3894` in the primary tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_3894.as
 */
export class NewUserExperienceGiftOfferEventParser implements IMessageParser
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_3894.as::_SafeStr_6117
    private _giftOptions: NewUserExperienceGiftOptions[] = [];

    /**
     * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_3894.as::flush()
     *
     * AS3 returns true without clearing anything — the list is replaced wholesale by the next
     * `parse()`, which builds a fresh vector.
     */
    flush(): boolean
    {
        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_3894.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        this._giftOptions = [];

        for(let i = 0; i < count; i++)
        {
            this._giftOptions.push(new NewUserExperienceGiftOptions(wrapper));
        }

        return true;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3895/_SafeCls_3894.as::get giftOptions()
    get giftOptions(): NewUserExperienceGiftOptions[]
    {
        return this._giftOptions;
    }
}
