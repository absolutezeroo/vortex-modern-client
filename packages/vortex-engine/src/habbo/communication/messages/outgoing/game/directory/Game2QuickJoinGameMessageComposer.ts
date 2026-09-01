import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "Put me in any arena" — the quick-join button. No arguments.
 *
 * Header 1506, from WIN63's registry (`_composers[1506] = _SafeCls_2129`), the name recovered from
 * `win63_version`'s filename and corroborated by the emulator's `Game2QuickJoinGameMessageEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2093/_SafeCls_2129.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/directory/Game2QuickJoinGameMessageComposer.as
 */
export class Game2QuickJoinGameMessageComposer extends MessageComposer<[]>
{
    // AS3: .../_SafePkg_2093/_SafeCls_2129.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
