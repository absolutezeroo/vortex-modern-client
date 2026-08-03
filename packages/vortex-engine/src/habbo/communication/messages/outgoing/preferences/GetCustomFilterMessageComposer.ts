import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * GetCustomFilterMessageComposer (header 801)
 *
 * Asks for the player's personal word-filter list. Sent once, when the word-filter window
 * is built. Carries no payload.
 *
 * Header read from WIN63's own registry (habbo/communication/_SafeCls_2046.as, _composers[801]).
 * The emulator's `Headers.cs` carries a different number for this message and implements
 * no handler or serializer for it at all, so it corroborates nothing here — see the note
 * in `WordFilterSettingsView`.
 *
 * Name DERIVED from `GetCustomFilterResultMessageEventParser`, the unobfuscated parser
 * that answers it; the AS3 composer class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2413/_SafeCls_2412.as
 */
export class GetCustomFilterMessageComposer extends MessageComposer<[]>
{
    // AS3: .../_SafeCls_2412.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
