import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "Which NFT avatar am I wearing?" No payload; the server answers with
 * `SelectedNftWardrobeOutfitMessageEvent`.
 *
 * Header **3521**, from WIN63's registry (`_composers[3521] = _SafeCls_3985`); the emulator
 * corroborates it as `GetSelectedNftWardrobeOutfitMessageEvent`, and the call site
 * `HabboAvatarEditor::sendGetSelectedNftWardrobeOutfitMessage()` agrees.
 *
 * ⚠ The AS3 class carries a **method** literally named `GetUserNftWardrobeMessageComposer()` —
 * empty, returning `*`. That is decompiler noise from a same-shaped sibling, not this class's
 * identity: naming this composer after it would collide with the genuine, unobfuscated
 * `GetUserNftWardrobeMessageComposer` at header 2203. Named from the call site instead.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1858/_SafeCls_3985.as
 */
export class GetSelectedNftWardrobeOutfitMessageComposer extends MessageComposer<[]>
{
    // AS3: .../src/unknowns/_SafePkg_1858/_SafeCls_3985.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
