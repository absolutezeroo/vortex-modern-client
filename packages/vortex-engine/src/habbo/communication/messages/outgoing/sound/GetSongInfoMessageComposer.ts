import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for the metadata of a batch of songs. The length prefix counts ids and is written by the
 * composer, not the caller — `HabboMusicController` hands it the whole pending queue at once.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetSongInfoMessageComposer.as
 * (`_SafeCls_3365` in the primary tree; header 3130 from its registry)
 */
export class GetSongInfoMessageComposer extends MessageComposer<number[]>
{
    private _data: number[];

    constructor(songIds: number[])
    {
        super();

        this._data = [songIds.length, ...songIds];
    }

    getMessageArray()
    {
        return this._data;
    }
}
