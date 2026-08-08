import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * One NFT avatar the user owns: five strings, all of them strings — the id and the token id
 * included, so neither is safe to treat as a number.
 *
 * The read order is **id, figure, gender, tokenId, contractKey**, but the accessors are declared
 * in a different order again. Unlike its two siblings this class is *not* obfuscated, so the field
 * names are the source's own.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/NftWardrobeItem.as
 */
export class NftWardrobeItem
{
    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::_id
    // Name DERIVED (`_SafeStr_4872`): the field behind `get id()`.
    private _id: string;

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::_figureString
    private _figureString: string;

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::_gender
    // Name DERIVED (`_SafeStr_4645`).
    private _gender: string;

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::_tokenId
    // Name DERIVED (`_SafeStr_9568`). A **string**, and the key `HabboAvatarEditor` matches its
    // remembered NFT outfit against.
    private _tokenId: string;

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::_contractKey
    private _contractKey: string;

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::NftWardrobeItem()
    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readString();
        this._figureString = wrapper.readString();
        this._gender = wrapper.readString();
        this._tokenId = wrapper.readString();
        this._contractKey = wrapper.readString();
    }

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::get id()
    get id(): string
    {
        return this._id;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::get gender()
    get gender(): string
    {
        return this._gender;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::get figureString()
    get figureString(): string
    {
        return this._figureString;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::get contractKey()
    get contractKey(): string
    {
        return this._contractKey;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/NftWardrobeItem.as::get tokenId()
    get tokenId(): string
    {
        return this._tokenId;
    }
}
