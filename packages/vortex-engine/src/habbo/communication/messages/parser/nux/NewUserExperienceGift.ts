import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {NewUserExperienceProductOffer} from './NewUserExperienceProductOffer';

/**
 * One selectable gift option of a NUX step — a thumbnail plus the products it contains.
 *
 * The view renders one list row per option: `thumbnailUrl` (resolved against the
 * `image.library.url` config) into the row's bitmap, and the joined product names into its
 * heading.
 *
 * Name recovered from PRODUCTION (`NewUserExperienceGift.as`), where the class is unobfuscated.
 * Note that the 2016 build named the same two accessors `_Str_13979` and **`roomTemplateName`**;
 * the current tree calls them `productOfferList` and `thumbnailUrl`, and those are the names used
 * here because they are the ones this revision's `NuxGiftSelectionView` reads.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4275.as
 */
export class NewUserExperienceGift
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4275.as::_SafeStr_8461
    private _productOfferList: NewUserExperienceProductOffer[];

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4275.as::_SafeStr_7236
    private _thumbnailUrl: string | null;

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4275.as::_SafeCls_4275()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._thumbnailUrl = wrapper.readString();

        if(this._thumbnailUrl === '')
        {
            this._thumbnailUrl = null;
        }

        this._productOfferList = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._productOfferList.push(new NewUserExperienceProductOffer(wrapper));
        }
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4275.as::get productOfferList()
    get productOfferList(): NewUserExperienceProductOffer[]
    {
        return this._productOfferList;
    }

    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2678/_SafeCls_4275.as::get thumbnailUrl()
    get thumbnailUrl(): string | null
    {
        return this._thumbnailUrl;
    }
}
