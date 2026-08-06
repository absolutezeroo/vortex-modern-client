import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask a jukebox what it is playing. Carries no payload. This is what
 * `JukeboxPlayListController.requestPlayList()` sends — the answer carries the play list with it.
 *
 * AS3: sources/win63_version/habbo/communication/messages/outgoing/sound/GetNowPlayingMessageComposer.as
 * (`_SafeCls_2479` in the primary tree; header 3707 from its registry)
 */
export class GetNowPlayingMessageComposer extends MessageComposer<[]>
{
    getMessageArray(): []
    {
        return [];
    }
}
