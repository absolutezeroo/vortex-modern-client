import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The jukebox has no room for another disc. Carries no payload — the message is the news.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/JukeboxPlayListFullMessageEventParser.as
 * (obfuscated as `_SafeCls_3923`'s parser in the primary tree)
 */
export class JukeboxPlayListFullMessageParser implements IMessageParser
{
    // AS3: .../JukeboxPlayListFullMessageEventParser.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../JukeboxPlayListFullMessageEventParser.as::parse()
    parse(_wrapper: IMessageDataWrapper): boolean
    {
        return true;
    }
}
