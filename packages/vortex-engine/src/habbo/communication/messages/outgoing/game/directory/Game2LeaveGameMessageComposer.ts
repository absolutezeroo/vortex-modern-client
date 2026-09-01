import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Leaves the lobby queue — the lobby window's close button and the ending panel's "leave" both
 * send it. No arguments.
 *
 * Not the same message as `Game2ExitGameMessageComposer` (3510), which leaves a *running* arena.
 *
 * Header 1847, from WIN63's registry (`_composers[1847] = _SafeCls_3649`), the name recovered from
 * `win63_version`'s filename and corroborated by the emulator's `Game2LeaveGameMessageEvent`.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2093/_SafeCls_3649.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/directory/Game2LeaveGameMessageComposer.as
 */
export class Game2LeaveGameMessageComposer extends MessageComposer<[]>
{
    // AS3: .../_SafePkg_2093/_SafeCls_3649.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
