import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Which NFT avatar the user is currently wearing, and what to fall back to when they take it off.
 *
 * `flush()` clears **only two of the three** fields — `currentTokenId` survives it, which is the
 * difference between "no NFT selected" and "an NFT whose id we have not been told again". AS3's;
 * kept, because `HabboAvatarEditor.hasNftOutfit()` tests exactly that field for null.
 *
 * Class name DERIVED: the AS3 parser is `_SafeCls_4339.as`; named after the emulator's
 * `GetSelectedNftWardrobeOutfitMessageEvent` (3521), whose answer this is.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3525/_SafeCls_4339.as
 */
export class SelectedNftWardrobeOutfitMessageParser implements IMessageParser
{
    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::_currentTokenId
    // Name DERIVED (`_SafeStr_6634`). Left **undefined** by AS3 until the first parse and never
    // cleared by `flush()` — null here, which is the value `hasNftOutfit()` compares against.
    private _currentTokenId: string | null = null;

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::_fallbackFigureString
    // Name DERIVED (`_SafeStr_8344`).
    private _fallbackFigureString: string = '';

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::_fallbackFigureGender
    // Name DERIVED (`_SafeStr_7873`).
    private _fallbackFigureGender: string = '';

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::get currentTokenId()
    get currentTokenId(): string | null
    {
        return this._currentTokenId;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::get fallbackFigureString()
    get fallbackFigureString(): string
    {
        return this._fallbackFigureString;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::get fallbackFigureGender()
    get fallbackFigureGender(): string
    {
        return this._fallbackFigureGender;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::flush()
    // Clears the two fallback fields and deliberately leaves the token id — see the class note.
    flush(): boolean
    {
        this._fallbackFigureString = '';
        this._fallbackFigureGender = '';

        return true;
    }

    // AS3: .../src/unknowns/_SafePkg_3525/_SafeCls_4339.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._currentTokenId = wrapper.readString();
        this._fallbackFigureString = wrapper.readString();
        this._fallbackFigureGender = wrapper.readString();

        return true;
    }
}
