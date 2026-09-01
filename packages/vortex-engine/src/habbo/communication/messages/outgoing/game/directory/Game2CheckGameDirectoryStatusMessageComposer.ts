import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks whether the game directory is up. The reply decides whether the games window opens at all —
 * `SnowWarEngine.onGameDirectoryAvailable()`. No arguments.
 *
 * Header 1115, from WIN63's registry (`_composers[1115]`); the emulator agrees
 * (`Game2CheckGameDirectoryStatusMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2093/Game2CheckGameDirectoryStatusMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/directory/Game2CheckGameDirectoryStatusMessageComposer.as
 */
export class Game2CheckGameDirectoryStatusMessageComposer extends MessageComposer<[]>
{
    // AS3: .../_SafePkg_2093/Game2CheckGameDirectoryStatusMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
