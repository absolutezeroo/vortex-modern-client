import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks for a rematch from the ending panel. No arguments.
 *
 * Header 855, from WIN63's registry (`_composers[855]`); the emulator agrees
 * (`Game2PlayAgainMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3158/Game2PlayAgainMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/arena/Game2PlayAgainMessageComposer.as
 */
export class Game2PlayAgainMessageComposer extends MessageComposer<[]>
{
    // AS3: .../_SafePkg_3158/Game2PlayAgainMessageComposer.as::getMessageArray()
    getMessageArray(): []
    {
        return [];
    }
}
