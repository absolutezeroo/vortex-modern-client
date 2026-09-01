import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Throws at a tile. Coordinates are tile times 3200, as everywhere else in the game's space, and
 * `trajectory` is one of `SnowBallGameObject.TRAJECTORY_*`.
 *
 * Header 2567, from WIN63's registry (`_composers[2567]`); the emulator agrees
 * (`Game2ThrowSnowballAtPositionMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2386/Game2ThrowSnowballAtPositionMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/ingame/Game2ThrowSnowballAtPositionMessageComposer.as
 */
export class Game2ThrowSnowballAtPositionMessageComposer extends MessageComposer<[number, number, number, number, number]>
{
    // AS3: .../_SafePkg_2386/Game2ThrowSnowballAtPositionMessageComposer.as::_SafeStr_4556
    private readonly _data: [number, number, number, number, number];

    constructor(x: number, y: number, trajectory: number, turn: number, subTurn: number)
    {
        super();

        this._data = [x, y, trajectory, turn, subTurn];
    }

    // AS3: .../_SafePkg_2386/Game2ThrowSnowballAtPositionMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number, number]
    {
        return this._data;
    }
}
