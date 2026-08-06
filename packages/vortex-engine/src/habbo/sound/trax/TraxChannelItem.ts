/**
 * One entry in a Trax channel: which sample, and how many bars it runs for.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/trax/TraxChannelItem.as
 */
export class TraxChannelItem
{
    // AS3: .../TraxChannelItem.as::_id
    private _id: number;

    // AS3: .../TraxChannelItem.as::_length
    private _length: number;

    // AS3: .../TraxChannelItem.as::TraxChannelItem()
    constructor(id: number, length: number)
    {
        this._id = id;
        this._length = length;
    }

    // AS3: .../TraxChannelItem.as::get id()
    // Sample id 0 is the silence entry — the sequencer skips it rather than mixing it.
    get id(): number
    {
        return this._id;
    }

    // AS3: .../TraxChannelItem.as::get length()
    // In bars, not samples.
    get length(): number
    {
        return this._length;
    }
}
