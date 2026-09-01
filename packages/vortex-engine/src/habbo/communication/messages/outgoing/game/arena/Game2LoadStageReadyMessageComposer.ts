import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "My stage is loaded" — sent once the room engine reports its objects initialised, with the
 * loading progress the client reached (always 100 in `SnowWarEngine.onRoomObjectsInitialized()`).
 *
 * Header 1320, from WIN63's registry (`_composers[1320]`); the emulator agrees
 * (`Game2LoadStageReadyMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_3158/Game2LoadStageReadyMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/arena/Game2LoadStageReadyMessageComposer.as
 */
export class Game2LoadStageReadyMessageComposer extends MessageComposer<[number]>
{
    // AS3: .../_SafePkg_3158/Game2LoadStageReadyMessageComposer.as::_SafeStr_4556
    private readonly _data: [number];

    constructor(progress: number)
    {
        super();

        this._data = [progress];
    }

    // AS3: .../_SafePkg_3158/Game2LoadStageReadyMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
