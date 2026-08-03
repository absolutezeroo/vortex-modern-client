import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * RemoveFromCustomFilterMessageComposer (header 2209)
 *
 * Removes one word from the player's personal filter, again by word rather than by
 * index. The list updates on the reply, not on the click.
 *
 * Header read from WIN63's own registry (habbo/communication/_SafeCls_2046.as, _composers[2209]).
 * The emulator's `Headers.cs` carries a different number for this message and implements
 * no handler or serializer for it at all, so it corroborates nothing here — see the note
 * in `WordFilterSettingsView`.
 *
 * Name DERIVED from `ModifyCustomFilterResultMessageEventParser`, the unobfuscated parser
 * that answers it; the AS3 composer class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2413/_SafeCls_2506.as
 */
export class RemoveFromCustomFilterMessageComposer extends MessageComposer<[string]>
{
    // AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2413/_SafeCls_2506.as::_SafeStr_4642
    private _data: [string];

    // AS3: .../_SafeCls_2506.as::_SafeCls_2506()
    constructor(word: string)
    {
        super();

        this._data = [word];
    }

    // AS3: .../_SafeCls_2506.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
