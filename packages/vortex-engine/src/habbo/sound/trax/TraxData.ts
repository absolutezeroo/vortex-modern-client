import {OrderedMap} from '@core/utils/OrderedMap';
import {Logger} from '@core/utils/Logger';
import {TraxChannel} from './TraxChannel';
import {TraxChannelItem} from './TraxChannelItem';

const log = Logger.getLogger('habbo.sound.trax.TraxData');

/**
 * A Trax song's structure, parsed from the one string the server sends with it.
 *
 * The format is colon-separated and read in *pairs* — a channel id, then that channel's items as
 * `sampleId,bars;sampleId,bars;…`. A trailing segment containing `meta` is a `key,value;…` list
 * instead, and is taken off the end before the pairs are read.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/sound/trax/TraxData.as
 */
export class TraxData
{
    // AS3: .../TraxData.as::_channels
    private _channels: TraxChannel[] = [];

    // AS3: .../TraxData.as::_metaData
    // Name DERIVED (`_SafeStr_7312`).
    private _metaData: OrderedMap<string, string> = new OrderedMap<string, string>();

    // AS3: .../TraxData.as::TraxData()
    constructor(songData: string)
    {
        const segments = songData.split(':');
        const lastSegment = String(segments[segments.length - 1]);
        let channelSegments = segments;

        if(lastSegment.indexOf('meta') !== -1)
        {
            for(const pair of lastSegment.split(';'))
            {
                const parts = pair.split(',');

                this._metaData.add(parts[0], parts[1]);
            }

            channelSegments = segments.slice(0, segments.length - 1);
        }

        for(let i = 0; i < channelSegments.length / 2; i++)
        {
            if(String(channelSegments[i * 2]).length === 0) continue;

            const channelId = parseInt(channelSegments[i * 2], 10);
            const items = String(channelSegments[i * 2 + 1]).split(';');
            const channel = new TraxChannel(channelId);

            for(const item of items)
            {
                const parts = item.split(',');

                // AS3 abandons the *whole* song on one malformed item — it returns from the
                // constructor, leaving every channel parsed so far in place and the rest dropped.
                if(parts.length !== 2)
                {
                    log.warn('Trax load error: invalid song data string');

                    return;
                }

                channel.addChannelItem(new TraxChannelItem(parseInt(parts[0], 10), parseInt(parts[1], 10)));
            }

            this._channels.push(channel);
        }
    }

    // AS3: .../TraxData.as::get channels()
    get channels(): TraxChannel[]
    {
        return this._channels;
    }

    // AS3: .../TraxData.as::getSampleIds()
    // Deduplicated, in first-seen order — this is the list the sample manager loads and the music
    // controller checks when samples are unloaded.
    getSampleIds(): number[]
    {
        const ids: number[] = [];

        for(const channel of this._channels)
        {
            for(let i = 0; i < channel.itemCount; i++)
            {
                const id = channel.getItem(i).id;

                if(ids.indexOf(id) === -1) ids.push(id);
            }
        }

        return ids;
    }

    // AS3: .../TraxData.as::get hasMetaData()
    // The key is literally `meta`; its value is not read, only its presence.
    get hasMetaData(): boolean
    {
        return this._metaData.getValue('meta') !== null;
    }

    // AS3: .../TraxData.as::get metaCutMode()
    // Cut mode rounds a sample's bar count instead of rounding it up — see the sequencer.
    get metaCutMode(): boolean
    {
        return this._metaData.getValue('c') === '1';
    }

    // AS3: .../TraxData.as::get metaTempo()
    get metaTempo(): number
    {
        return parseInt(this._metaData.getValue('t') ?? '0', 10);
    }
}
