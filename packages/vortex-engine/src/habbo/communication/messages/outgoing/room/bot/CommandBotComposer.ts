import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Run a skill on a rentable bot, or store its configuration.
 *
 * @see sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2929/_SafeCls_2928.as
 *
 * Header **3813**, from WIN63's registry (`_SafeCls_2046.as::_composers[3813]`). Corroborated by
 * vortex-emulator's `CommandBotEvent = 3813`.
 *
 * Body is `(botId, commandId, data)`. `commandId` is a {@link BotSkillEnum} value; `data` is empty
 * for the fire-and-forget skills the context menu triggers (dress up, random walk, dance, donate)
 * and carries the configuration for the two that have an editor (chatter 2, change name 5).
 *
 * The name comes from vortex-emulator; no unobfuscated tree carries this composer.
 */
export class CommandBotComposer extends MessageComposer<[number, number, string]>
{
    // AS3: .../_SafeCls_2928.as::getMessageArray() backing fields — obfuscated in every tree.
    private _data: [number, number, string];

    constructor(botId: number, commandId: number, data: string)
    {
        super();
        this._data = [botId, commandId, data];
    }

    // AS3: .../_SafeCls_2928.as::getMessageArray()
    getMessageArray(): [number, number, string]
    {
        return this._data;
    }
}
