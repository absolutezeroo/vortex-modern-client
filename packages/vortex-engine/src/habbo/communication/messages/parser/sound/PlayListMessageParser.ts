import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {SongData} from './TraxSongInfoMessageParser';

/**
 * A sound machine's whole play list, plus how far into it the room already is.
 *
 * `synchronizationCount` is a position in **milliseconds across the entire list**, not into one
 * song — `SoundMachinePlayListController` walks the entries subtracting each length until it lands
 * inside one, which is how a room that has been playing for ten minutes starts you in the right
 * place in the right track.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/PlayListMessageEventParser.as
 * (obfuscated as `_SafeCls_4224` in the primary tree)
 */
export class PlayListMessageParser implements IMessageParser
{
    private _synchronizationCount: number = 0;

    // AS3: .../PlayListMessageEventParser.as::get synchronizationCount()
    get synchronizationCount(): number
    {
        return this._synchronizationCount;
    }

    private _playList: SongData[] = [];

    // AS3: .../PlayListMessageEventParser.as::get playList()
    get playList(): SongData[]
    {
        return this._playList;
    }

    // AS3: .../PlayListMessageEventParser.as::flush()
    flush(): boolean
    {
        this._playList = [];

        return true;
    }

    /**
     * AS3: .../PlayListMessageEventParser.as::parse()
     *
     * Two pieces of decompiler damage here, both repaired against the intact sibling
     * (`PlayListSongAddedMessageEventParser`, which reads the same four fields): the loop is
     * `while(0 < count)` with an untested counter, and the entry is built as
     * `new class_3136(0, 0, null, null)` with the four values it just read thrown away. The read
     * order — id, length, name, creator — is what the sibling and the shared base both use.
     */
    // AS3: sources/win63_version/habbo/communication/messages/parser/sound/PlayListMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._synchronizationCount = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const id = wrapper.readInt();
            const length = wrapper.readInt();
            const name = wrapper.readString();
            const creator = wrapper.readString();

            this._playList.push(new SongData(id, length, name, creator, ''));
        }

        return true;
    }
}
