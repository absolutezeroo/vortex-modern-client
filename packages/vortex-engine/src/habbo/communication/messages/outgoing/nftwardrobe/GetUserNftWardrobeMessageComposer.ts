import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "Send me the NFT avatars I own." No payload.
 *
 * Header **2203**, from WIN63's registry (`_composers[2203] = GetUserNftWardrobeMessageComposer`)
 * — one of the few avatar-editor composers whose AS3 class is **not** obfuscated, so the name is
 * recovered rather than derived. The emulator agrees.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_1858/GetUserNftWardrobeMessageComposer.as
 */
export class GetUserNftWardrobeMessageComposer extends MessageComposer<[]>
{
    // AS3: .../src/unknowns/_SafePkg_1858/GetUserNftWardrobeMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
