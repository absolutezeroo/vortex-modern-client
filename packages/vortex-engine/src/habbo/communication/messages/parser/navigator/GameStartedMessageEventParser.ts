import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import type {IMessageParser} from '@core/communication/messages/IMessageParser';

/**
 * GameStartedMessageEventParser
 *
 * A game lobby started. The navigator only closes its main view on this - it never
 * reads the payload.
 *
 * Name recovered from the emulator's `Game2GameStartedMessageComposer = 2902`; the AS3
 * class is obfuscated in every available tree.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/_SafeCls_4302.as
 */
export class GameStartedMessageEventParser implements IMessageParser
{
    /**
     * TODO(AS3): sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4164/_SafeCls_4302.as::parse()
     * builds a `GameLobbyData` from the buffer and exposes it as `lobbyData`. That class is
     * not ported, and the navigator's only handler for this message ignores the payload
     * entirely (`_SafeCls_1951.as::onGameStarted()` just closes the main view), so nothing
     * is read here. Messages are length-delimited, so leaving the body unread cannot
     * desynchronise the stream.
     */

    // AS3: .../_SafeCls_4302.as::flush()
    flush(): boolean
    {
        return true;
    }

    // AS3: .../_SafeCls_4302.as::parse()
    parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        return true;
    }
}
