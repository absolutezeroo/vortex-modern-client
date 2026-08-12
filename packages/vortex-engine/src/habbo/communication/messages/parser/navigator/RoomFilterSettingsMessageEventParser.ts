import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * RoomFilterSettingsMessageEventParser
 *
 * The room's word-filter list, which fills `RoomFilterCtrl`.
 *
 * Name recovered from the emulator's `RoomFilterSettingsMessageComposer = 3208`; the
 * AS3 class is obfuscated in every available tree.
 *
 * The trace used to name `_SafePkg_2213`, which holds the *event* class (`_SafeCls_2846`); the
 * parser it builds lives in `_SafePkg_2918`. The old path resolved to no file at all.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2918/_SafeCls_3620.as
 */
export class RoomFilterSettingsMessageEventParser implements IMessageParser
{
    // AS3: .../_SafePkg_2918/_SafeCls_3620.as::_SafeStr_5075
    private _badWords: string[] = [];

    // AS3: .../_SafePkg_2918/_SafeCls_3620.as::get badWords()
    get badWords(): string[]
    {
        return this._badWords;
    }

    // AS3: .../_SafePkg_2918/_SafeCls_3620.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafePkg_2918/_SafeCls_3620.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._badWords = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._badWords.push(wrapper.readString());

        // AS3 returns FALSE here, alone among the navigator's parsers. Preserved: the
        // message system treats the return as "parsed successfully", and the handler runs
        // either way in this port as it does there.
        return false;
    }
}
