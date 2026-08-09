import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Ask for a bot skill's stored configuration, so its editor opens filled in.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2929/_SafeCls_3415.as
 *
 * Header **2311**, from WIN63's registry (`_SafeCls_2046.as::_composers[2311]`). Corroborated by
 * vortex-emulator's `GetBotCommandConfigurationDataEvent = 2311`. Answered by
 * `BotCommandConfigurationEvent` (2463).
 *
 * The name comes from vortex-emulator; no unobfuscated tree carries this composer.
 */
export class GetBotCommandConfigurationDataComposer extends MessageComposer<[number, number]>
{
    // AS3: .../_SafeCls_3415.as::getMessageArray() backing fields — obfuscated in every tree.
    private _data: [number, number];

    constructor(botId: number, commandId: number)
    {
        super();
        this._data = [botId, commandId];
    }

    // AS3: .../_SafeCls_3415.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
