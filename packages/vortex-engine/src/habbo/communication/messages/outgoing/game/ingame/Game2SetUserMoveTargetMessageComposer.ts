import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "Walk me there." The coordinates are in the game's fixed-point space — `SnowWarEngine` multiplies
 * the tile by 3200 — and the turn/sub-turn pair is the timestamp the server replays the input at,
 * which is why every in-game composer carries it.
 *
 * Header 172, from WIN63's registry (`_composers[172]`); the emulator agrees
 * (`Game2SetUserMoveTargetMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2386/Game2SetUserMoveTargetMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/ingame/Game2SetUserMoveTargetMessageComposer.as
 */
export class Game2SetUserMoveTargetMessageComposer extends MessageComposer<[number, number, number, number]>
{
    // AS3: .../_SafePkg_2386/Game2SetUserMoveTargetMessageComposer.as::_SafeStr_4556
    private readonly _data: [number, number, number, number];

    constructor(x: number, y: number, turn: number, subTurn: number)
    {
        super();

        this._data = [x, y, turn, subTurn];
    }

    // AS3: .../_SafePkg_2386/Game2SetUserMoveTargetMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number]
    {
        return this._data;
    }
}
