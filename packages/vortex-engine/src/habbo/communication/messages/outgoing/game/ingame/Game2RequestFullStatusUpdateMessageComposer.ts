import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * "I have lost sync, send me the whole arena." The reason is the three cases `SnowWarEngine.update()`
 * distinguishes: `0` the client fell more than three turns behind, `1` the folded checksum
 * disagreed with the server's, `-1` the desync was generated on purpose by
 * `generateChecksumMismatch()`.
 *
 * Header 3147, from WIN63's registry (`_composers[3147]`); the emulator agrees
 * (`Game2RequestFullStatusUpdateMessageEvent`).
 *
 * AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_2386/Game2RequestFullStatusUpdateMessageComposer.as
 * @see sources/win63_version/habbo/communication/messages/outgoing/game/ingame/Game2RequestFullStatusUpdateMessageComposer.as
 */
export class Game2RequestFullStatusUpdateMessageComposer extends MessageComposer<[number]>
{
    // AS3: .../_SafePkg_2386/Game2RequestFullStatusUpdateMessageComposer.as::_SafeStr_4556
    private readonly _data: [number];

    constructor(reason: number)
    {
        super();

        this._data = [reason];
    }

    // AS3: .../_SafePkg_2386/Game2RequestFullStatusUpdateMessageComposer.as::getMessageArray()
    getMessageArray(): [number]
    {
        return this._data;
    }
}
