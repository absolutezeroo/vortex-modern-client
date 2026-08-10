import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * The numeric song id behind an official song code, in reply to GetOfficialSongIdMessageComposer.
 *
 * The code comes back with it so a caller can tell whose reply this is — the catalog's song-disk
 * widget compares it against the code it asked for before touching its view.
 *
 * AS3: sources/win63_version/habbo/communication/messages/parser/sound/OfficialSongIdMessageEventParser.as
 * (`_SafeCls_4287` in the primary tree)
 */
export class OfficialSongIdMessageParser implements IMessageParser
{
    // AS3: .../OfficialSongIdMessageEventParser.as::_officialSongId
    private _officialSongId: string = '';

    // AS3: .../OfficialSongIdMessageEventParser.as::_songId
    private _songId: number = 0;

    // AS3: .../OfficialSongIdMessageEventParser.as::get officialSongId()
    get officialSongId(): string
    {
        return this._officialSongId;
    }

    // AS3: .../OfficialSongIdMessageEventParser.as::get songId()
    get songId(): number
    {
        return this._songId;
    }

    // AS3: .../OfficialSongIdMessageEventParser.as::flush()
    flush(): boolean
    {
        this._officialSongId = '';
        this._songId = 0;

        return true;
    }

    // AS3: .../OfficialSongIdMessageEventParser.as::parse()
    // String first, then the id — the reverse of how the getters are declared.
    parse(wrapper: IMessageDataWrapper): boolean
    {
        this._officialSongId = wrapper.readString();
        this._songId = wrapper.readInt();

        return true;
    }
}
