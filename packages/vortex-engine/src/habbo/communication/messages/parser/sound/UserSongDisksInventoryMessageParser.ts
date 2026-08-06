import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';
import {OrderedMap} from '@core/utils/OrderedMap';

/**
 * Which song sits on which of your song disks — the pairs are disk id → song id, and the order
 * they arrive in is the order the inventory shows them, which is why this is an ordered map and
 * not a plain one.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/UserSongDisksInventoryMessageEventParser.as
 * (obfuscated as `_SafeCls_3657` in the primary tree)
 */
export class UserSongDisksInventoryMessageParser implements IMessageParser
{
    // AS3: .../UserSongDisksInventoryMessageEventParser.as::_songDisks
    private _songDisks: OrderedMap<number, number> = new OrderedMap<number, number>();

    // AS3: .../UserSongDisksInventoryMessageEventParser.as::get songDiskCount()
    get songDiskCount(): number
    {
        return this._songDisks.length;
    }

    // AS3: .../UserSongDisksInventoryMessageEventParser.as::getDiskId()
    getDiskId(index: number): number
    {
        if(index >= 0 && index < this._songDisks.length)
        {
            return this._songDisks.getKey(index) ?? -1;
        }

        return -1;
    }

    // AS3: .../UserSongDisksInventoryMessageEventParser.as::getSongId()
    getSongId(index: number): number
    {
        if(index >= 0 && index < this._songDisks.length)
        {
            return this._songDisks.getWithIndex(index) ?? -1;
        }

        return -1;
    }

    // AS3: .../UserSongDisksInventoryMessageEventParser.as::flush()
    flush(): boolean
    {
        this._songDisks.reset();

        return true;
    }

    // AS3: .../UserSongDisksInventoryMessageEventParser.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
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
