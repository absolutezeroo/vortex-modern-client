import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Leaves the arena, sent from the ending panel and from the loading view's cancel.
 *
 * The boolean is on the wire but no call site sets it: all three construct
 * `new Game2ExitGameMessageComposer()` and take the `true` default, so what `false` would mean is
 * not recoverable from this client. Keep the parameter — the server reads a byte either way.
 *
 * Header 3510, from WIN63's registry (`_composers[3510]`); the emulator agrees
 * (`Game2ExitGameMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3158/Game2ExitGameMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/arena/Game2ExitGameMessageComposer.as
 */
export class Game2ExitGameMessageComposer extends MessageComposer<[boolean]>
{
    // AS3: .../_SafePkg_3158/Game2ExitGameMessageComposer.as::_SafeStr_9343
    private readonly _data: [boolean];

    constructor(leaveArena: boolean = true)
    {
        super();

        this._data = [leaveArena];
    }

    // AS3: .../_SafePkg_3158/Game2ExitGameMessageComposer.as::getMessageArray()
    getMessageArray(): [boolean]
    {
        return this._data;
    }
}
