import type {TraxChannelItem} from './TraxChannelItem';

/**
 * One channel of a Trax song: an ordered list of samples to play through.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/trax/TraxChannel.as
 */
export class TraxChannel
{
    // AS3: .../TraxChannel.as::_id
    private _id: number;

    // AS3: .../TraxChannel.as::_items
    private _items: TraxChannelItem[] = [];

    // AS3: .../TraxChannel.as::TraxChannel()
    constructor(id: number)
    {
        this._id = id;
    }

    // TS-only: no AS3 counterpart — AS3 stores the channel id and never reads it back, but the
    // field is real, so it is kept readable rather than dropped.
    get id(): number
    {
        return this._id;
    }

    // AS3: .../TraxChannel.as::get itemCount()
    get itemCount(): number
    {
        return this._items.length;
    }

    // AS3: .../TraxChannel.as::addChannelItem()
    addChannelItem(item: TraxChannelItem): void
    {
        this._items.push(item);
    }

    // AS3: .../TraxChannel.as::getItem()
    getItem(index: number): TraxChannelItem
    {
        return this._items[index];
    }
}
