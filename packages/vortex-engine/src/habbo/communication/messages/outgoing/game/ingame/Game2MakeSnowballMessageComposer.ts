import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Starts making a snowball, timestamped with the turn and sub-turn it was asked for on.
 *
 * Header 2604, from WIN63's registry (`_composers[2604]`); the emulator agrees
 * (`Game2MakeSnowballMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2386/Game2MakeSnowballMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/ingame/Game2MakeSnowballMessageComposer.as
 */
export class Game2MakeSnowballMessageComposer extends MessageComposer<[number, number]>
{
    // AS3: .../_SafePkg_2386/Game2MakeSnowballMessageComposer.as::_SafeStr_4556
    private readonly _data: [number, number];

    constructor(turn: number, subTurn: number)
    {
        super();

        this._data = [turn, subTurn];
    }

    // AS3: .../_SafePkg_2386/Game2MakeSnowballMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number]
    {
        return this._data;
    }
}
