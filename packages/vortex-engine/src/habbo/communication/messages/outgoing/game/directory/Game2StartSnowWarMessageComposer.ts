import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Joins a named snow-war arena — the string is the field name the lobby list offered.
 *
 * Header 2109, from WIN63's registry (`_composers[2109] = _SafeCls_2092`). The class name is
 * obfuscated in the primary tree; `win63_version` ships the same class under its real filename,
 * and the emulator's `Game2StartSnowWarMessageEvent` carries the same recovery note — it used to
 * sit on 1506, which is quick-join, so starting a named game landed in the quick-join handler.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2093/_SafeCls_2092.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/directory/Game2StartSnowWarMessageComposer.as
 */
export class Game2StartSnowWarMessageComposer extends MessageComposer<[string]>
{
    // AS3: .../_SafePkg_2093/_SafeCls_2092.as::_SafeStr_4556
    private readonly _data: [string];

    constructor(arenaName: string)
    {
        super();

        this._data = [arenaName];
    }

    // AS3: .../_SafePkg_2093/_SafeCls_2092.as::getMessageArray()
    getMessageArray(): [string]
    {
        return this._data;
    }
}
