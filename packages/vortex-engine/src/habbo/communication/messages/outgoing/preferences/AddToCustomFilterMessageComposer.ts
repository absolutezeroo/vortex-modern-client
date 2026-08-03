import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * AddToCustomFilterMessageComposer (header 2656)
 *
 * Adds one word to the player's personal filter. The list is not touched locally: the
 * reply, `ModifyCustomFilterResult`, is what puts the word on screen.
 *
 * Header read from WIN63's own registry (habbo/communication/_SafeCls_2046.as, _composers[2656]).
 * The emulator's `Headers.cs` carries a different number for this message and implements
 * no handler or serializer for it at all, so it corroborates nothing here — see the note
 * in `WordFilterSettingsView`.
 *
 * Name DERIVED from `ModifyCustomFilterResultMessageEventParser`, the unobfuscated parser
 * that answers it; the AS3 composer class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2413/_SafeCls_2763.as
 */
export class AddToCustomFilterMessageComposer extends MessageComposer<[string]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2413/_SafeCls_2763.as::_SafeStr_4642
    private _data: [string];

    // AS3: .../_SafeCls_2763.as::_SafeCls_2763()
    constructor(word: string)
    {
        super();

        this._data = [word];
    }

    // AS3: .../_SafeCls_2763.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
