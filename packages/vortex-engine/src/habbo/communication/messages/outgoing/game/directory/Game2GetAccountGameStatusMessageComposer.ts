import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Asks how many games this account has left for one game type — the reply is what feeds
 * `SnowWarEngine.gamesLeft()`, and through it the "free games left" counters in the main window
 * and the ending panel. `0` is snow war.
 *
 * Header 3377, from WIN63's registry (`_composers[3377]`), which is also where the emulator's
 * `Game2GetAccountGameStatusMessageEvent` was recovered from after it had been parked at 9013.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2093/Game2GetAccountGameStatusMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/directory/Game2GetAccountGameStatusMessageComposer.as
 */
export class Game2GetAccountGameStatusMessageComposer extends MessageComposer<[number]>
{
    // AS3: .../_SafePkg_2093/Game2GetAccountGameStatusMessageComposer.as::_SafeStr_4556
    private readonly _data: [number];

    constructor(gameId: number)
    {
        super();

        this._data = [gameId];
    }

    // AS3: .../_SafePkg_2093/Game2GetAccountGameStatusMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
