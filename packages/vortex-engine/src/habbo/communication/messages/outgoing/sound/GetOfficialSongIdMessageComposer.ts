import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Resolve an *official* song code to the numeric song id everything else in the sound stack keys
 * on. A catalog song-disk offer whose `extraParam` does not parse as a number is carrying one of
 * these codes; the reply arrives as OfficialSongIdMessageEvent.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetOfficialSongIdMessageComposer.as
 * (`_SafeCls_2775` in the primary tree; header 1723 from its registry — win63_version's own
 * registry says 3938, which is that older build's id and must not be used here.)
 */
export class GetOfficialSongIdMessageComposer extends MessageComposer<[string]>
{
    private _data: [string];

    constructor(officialSongId: string)
    {
        super();

        this._data = [officialSongId];
    }

    // AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetOfficialSongIdMessageComposer.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
