import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Throws at another player. The aim is resolved server-side at the turn this is replayed on, not
 * where the target stood when the click happened — see `HumanThrowsSnowballAtHumanEvent`.
 *
 * `trajectory` is one of `SnowBallGameObject.TRAJECTORY_*`, which `SnowWarEngine` maps from the
 * modifier keys through `ClickType`.
 *
 * Header 3738, from WIN63's registry (`_composers[3738]`); the emulator agrees
 * (`Game2ThrowSnowballAtHumanMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2386/Game2ThrowSnowballAtHumanMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/ingame/Game2ThrowSnowballAtHumanMessageComposer.as
 */
export class Game2ThrowSnowballAtHumanMessageComposer extends MessageComposer<[number, number, number, number]>
{
    // AS3: .../_SafePkg_2386/Game2ThrowSnowballAtHumanMessageComposer.as::_SafeStr_4556
    private readonly _data: [number, number, number, number];

    constructor(targetGameObjectId: number, trajectory: number, turn: number, subTurn: number)
    {
        super();

        this._data = [targetGameObjectId, trajectory, turn, subTurn];
    }

    // AS3: .../_SafePkg_2386/Game2ThrowSnowballAtHumanMessageComposer.as::getMessageArray()
    getMessageArray(): [number, number, number, number]
    {
        return this._data;
    }
}
