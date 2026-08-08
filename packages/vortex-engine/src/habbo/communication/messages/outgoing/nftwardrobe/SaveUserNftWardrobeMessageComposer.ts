import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "Wear this NFT avatar." Carries the outfit's **id**, not its token id — both are strings and the
 * two are easy to swap; `HabboAvatarEditor.saveCurrentSelection()` passes `_setNftOutfit.id`.
 *
 * Header **3428**, from WIN63's registry
 * (`_composers[3428] = SaveUserNftWardrobeMessageComposer`) — unobfuscated in AS3, so the name is
 * recovered. The emulator agrees.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1858/SaveUserNftWardrobeMessageComposer.as
 */
export class SaveUserNftWardrobeMessageComposer extends MessageComposer<[string]>
{
    // AS3: .../src/unknowns/_SafePkg_1858/SaveUserNftWardrobeMessageComposer.as::_data
    // Name DERIVED (`_SafeStr_4642`).
    private _data: [string];

    // AS3: .../src/unknowns/_SafePkg_1858/SaveUserNftWardrobeMessageComposer.as::SaveUserNftWardrobeMessageComposer()
    constructor(outfitId: string)
    {
        super();

        this._data = [outfitId];
    }

    // AS3: .../src/unknowns/_SafePkg_1858/SaveUserNftWardrobeMessageComposer.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
