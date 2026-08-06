import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {OrderedMap} from '@core/utils/OrderedMap';

/**
 * The discs currently in the room's jukebox — disk id → song id, in play order — and how many it
 * can hold.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/JukeboxSongDisksMessageEventParser.as
 * (obfuscated as `_SafeCls_4232` in the primary tree)
 */
export class JukeboxSongDisksMessageParser implements IMessageParser
{
    private _maxLength: number = 0;

    // AS3: .../JukeboxSongDisksMessageEventParser.as::get maxLength()
    get maxLength(): number
    {
        return this._maxLength;
    }

    private _songDisks: OrderedMap<number, number> = new OrderedMap<number, number>();

    // AS3: .../JukeboxSongDisksMessageEventParser.as::get songDisks()
    get songDisks(): OrderedMap<number, number>
    {
        return this._songDisks;
    }

    // AS3: .../JukeboxSongDisksMessageEventParser.as::flush()
    flush(): boolean
    {
        this._songDisks.reset();

        return true;
    }

    /**
     * AS3: .../JukeboxSongDisksMessageEventParser.as::parse()
     *
     * The dump's loop is `while(0 < count)` with a counter that is incremented but never tested —
     * decompiler damage, the same shape as the badges parser's. The read itself is intact and is
     * what is ported: max length, then a count, then that many (diskId, songId) pairs.
     */
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._maxLength = wrapper.readInt();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const diskId = wrapper.readInt();
            const songId = wrapper.readInt();

            this._songDisks.add(diskId, songId);
        }

        return true;
    }
}
